import { parseJob, InputError } from '../validation'
import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import { Job } from '../models/Job'
import { requireAuth, optionalAuth } from '../middleware/requireAuth'
import { upload, UPLOAD_DIR, saveImages } from '../upload'

const router = Router()

// reject malformed ids before they reach the database
router.param('id', (_req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ error: 'Invalid job id' })
    return
  }
  next()
})

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

function removeFiles(urls: string[]) {
  urls.forEach((url) => fs.unlink(path.join(UPLOAD_DIR, path.basename(url)), () => {}))
}

// GET /api/jobs?city=&category=&q=   -> open jobs for the "looking for a job" list
router.get('/', optionalAuth, async (req, res) => {
  const city = str(req.query.city)
  const category = str(req.query.category)
  const q = str(req.query.q)
  if (city.length > 80 || q.length > 200 || category.length > 40) throw new InputError('Search is too long')
  const pageText = req.query.page ?? '1'
  if (typeof pageText !== 'string' || !/^[1-9]\d{0,5}$/.test(pageText)) throw new InputError('Invalid page')
  const page = Number(pageText)
  const pageSize = 50

  const filter: Record<string, unknown> = { status: 'open' }
  if (city) filter.city = new RegExp(escapeRegex(city), 'i')
  if (category) filter.category = category
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i')
    filter.$or = [{ title: rx }, { description: rx }]
  }

  const query = Job.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * pageSize).limit(pageSize + 1).populate('postedBy', 'name')
  // contact details are only for logged-in users
  if (!req.userId) query.select('-phone -email')

  const jobs = await query
  res.json({ jobs: jobs.slice(0, pageSize), page, hasMore: jobs.length > pageSize })
})

// GET /api/jobs/mine/posted
router.get('/mine/posted', requireAuth, async (req, res) => {
  const jobs = await Job.find({ postedBy: req.userId })
    .sort({ createdAt: -1 })
    .populate('postedBy acceptedBy', 'name')
  res.json({ jobs })
})

// GET /api/jobs/mine/accepted
router.get('/mine/accepted', requireAuth, async (req, res) => {
  const jobs = await Job.find({ acceptedBy: req.userId })
    .sort({ updatedAt: -1 })
    .populate('postedBy acceptedBy', 'name')
  res.json({ jobs })
})

// GET /api/jobs/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const query = Job.findById(req.params.id).populate('postedBy acceptedBy', 'name')
  if (!req.userId) query.select('-phone -email')
  const job = await query
  if (!job) {
    res.status(404).json({ error: 'Job not found' })
    return
  }
  res.json({ job })
})

// POST /api/jobs  (multipart form: fields + up to 6 "images")
router.post('/', requireAuth, upload.array('images', 6), async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? []
  const fields = parseJob(req.body ?? {})
  const images = await saveImages(files)
  try {
    const job = await Job.create({ ...fields, images, postedBy: req.userId })
    res.status(201).json({ job })
  } catch (err) {
    removeFiles(images)
    throw err
  }
})

// POST /api/jobs/:id/accept
router.post('/:id/accept', requireAuth, async (req, res) => {
  // one atomic update, so two people can't accept the same job
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, status: 'open', postedBy: { $ne: req.userId } },
    { status: 'in_progress', acceptedBy: req.userId },
    { new: true },
  ).populate('postedBy acceptedBy', 'name')

  if (!job) {
    res.status(409).json({ error: 'This job is no longer available (or it is your own job)' })
    return
  }
  res.json({ job })
})

// POST /api/jobs/:id/complete  (poster or the person who accepted it)
router.post('/:id/complete', requireAuth, async (req, res) => {
  const job = await Job.findOneAndUpdate(
    {
      _id: req.params.id,
      status: 'in_progress',
      $or: [{ postedBy: req.userId }, { acceptedBy: req.userId }],
    },
    { status: 'done', completedAt: new Date() },
    { new: true },
  ).populate('postedBy acceptedBy', 'name')

  if (!job) {
    res.status(404).json({ error: 'Job not found or not in progress' })
    return
  }
  res.json({ job })
})

// DELETE /api/jobs/:id  (poster only, only while still open)
router.delete('/:id', requireAuth, async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.userId, status: 'open' })
  if (!job) {
    res.status(404).json({ error: 'Job not found, or it was already accepted' })
    return
  }
  removeFiles(job.images)
  res.json({ ok: true })
})

export default router
