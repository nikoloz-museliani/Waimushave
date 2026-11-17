import { Router } from 'express'
import { Job } from '../models/Job'
const router = Router()

// XML escaping is required even for database content. Never construct a sitemap
// origin from the request Host header: a client can supply that header itself.
const escapeXml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!,
  )
function siteOrigin() {
  try {
    const url = new URL(process.env.SITE_URL ?? '')
    return url.protocol === 'https:' ? url.origin : null
  } catch {
    return null
  }
}
router.get('/robots.txt', (_req, res) => {
  const origin = siteOrigin()
  res
    .type('text/plain')
    .send(`User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''}`)
})
router.get('/sitemap.xml', async (_req, res) => {
  const origin = siteOrigin()
  if (!origin) {
    res.status(503).type('text/plain').send('Configure SITE_URL before publishing the sitemap.')
    return
  }
  // Sitemap protocol permits 50,000 URLs. This early-stage endpoint reserves one
  // for home; use a sitemap index/shards if the platform exceeds 49,999 open jobs.
  const jobs = await Job.find({ status: 'open' })
    .select('_id updatedAt')
    .sort({ _id: 1 })
    .limit(49999)
    .lean()
  const entries = [
    `<url><loc>${escapeXml(origin)}/</loc></url>`,
    ...jobs.map(
      (job) =>
        `<url><loc>${escapeXml(origin)}/jobs/${job._id}</loc><lastmod>${new Date(job.updatedAt).toISOString()}</lastmod></url>`,
    ),
  ]
  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`,
    )
})
export default router
