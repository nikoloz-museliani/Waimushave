import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseJob } from '../src/validation'
import { normalizeImage, upload } from '../src/upload'
import sharp from 'sharp'
import express from 'express'
import authRoutes from '../src/routes/authRoutes'
import jobRoutes from '../src/routes/jobRoutes'

const valid = { title: 'Move a table', description: 'Move it upstairs', phone: '+995 555 123 456', email: 'POSTER@example.com', city: 'Tbilisi', street: 'Test street', price: '25.50' }
test('valid job defaults to GEL and normalizes contact details', () => {
  const job = parseJob(valid)
  assert.equal(job.currency, 'GEL'); assert.equal(job.email, 'poster@example.com'); assert.equal(job.price, 25.5)
})
for (const [label, fields] of Object.entries({
  'duplicate multipart field': { title: ['one', 'two'] },
  'invalid email': { email: 'not-email' },
  'negative price': { price: '-1' },
  'nonfinite price': { price: 'Infinity' },
  'invalid category': { category: 'arbitrary' },
  'invalid currency': { currency: 'XXX' },
  'invalid coordinates': { lat: '91', lng: '40' },
  'partial coordinates': { lat: '40' },
  'invalid date': { startDate: '2026-02-30' },
  'long street': { street: 'x'.repeat(201) },
})) test(`rejects ${label}`, () => assert.throws(() => parseJob({ ...valid, ...fields })))
test('coordinates at zero are valid', () => assert.deepEqual(parseJob({ ...valid, lat: '0', lng: '0' }).location, { lat: 0, lng: 0 }))
test('decodes and normalizes a real image', async () => {
  const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: 'red' } }).png().toBuffer()
  const output = await normalizeImage(png)
  assert.equal((await sharp(output).metadata()).format, 'webp')
})
test('rejects fake and truncated image bytes', async () => {
  await assert.rejects(normalizeImage(Buffer.from('<script>alert(1)</script>')))
  await assert.rejects(normalizeImage(Buffer.from([137, 80, 78, 71])))
})
test('HTTP boundaries enforce auth, pagination, upload contents and throttling', async () => {
  const app = express(); app.use(express.json()); app.use('/auth', authRoutes); app.use('/jobs', jobRoutes)
  app.post('/image', upload.single('image'), async (req, res) => { await normalizeImage(req.file!.buffer); res.sendStatus(204) })
  app.use((error: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(error.status ?? 500).json({ error: error.message }))
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.on('listening', resolve))
  const address = server.address(); assert.ok(address && typeof address !== 'string')
  const base = `http://127.0.0.1:${address.port}`
  try {
    for (const route of ['/jobs', '/jobs/507f1f77bcf86cd799439011/accept', '/jobs/507f1f77bcf86cd799439011/complete']) {
      assert.equal((await fetch(base + route, { method: 'POST' })).status, 401)
    }
    assert.equal((await fetch(base + '/jobs?page=-1')).status, 400)
    const data = new FormData(); data.append('image', new Blob(['<html>fake</html>'], { type: 'image/png' }), 'fake.png')
    assert.equal((await fetch(base + '/image', { method: 'POST', body: data })).status, 400)
    let response: Response | undefined
    for (let i = 0; i < 31; i++) response = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    assert.equal(response!.status, 429)
  } finally { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) }
})
