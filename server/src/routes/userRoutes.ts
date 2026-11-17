import { Router } from 'express'
import mongoose from 'mongoose'
import { User, toPublicUser } from '../models/User'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()

// PUT /api/users/me  - edit my profile
// /me always refers to the verified caller. Whitelist editable fields so a
// client cannot overwrite passwordHash, email, or account identity.
router.put('/me', requireAuth, async (req, res) => {
  const { name, phone, city, bio } = req.body ?? {}
  const update: Record<string, string> = {}

  if (typeof name === 'string' && name.trim()) update.name = name.trim()
  if (typeof phone === 'string') update.phone = phone.trim()
  if (typeof city === 'string') update.city = city.trim()
  if (typeof bio === 'string') update.bio = bio.trim()

  const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json({ user: toPublicUser(user) })
})

// GET /api/users/:id  - public profile of someone else (no email/phone)
// Public profiles intentionally omit contact details and password hashes.
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: 'Invalid user id' })
    return
  }
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json({ user: { _id: user.id, name: user.name, city: user.city, bio: user.bio } })
})

export default router
