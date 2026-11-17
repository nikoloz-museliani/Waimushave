import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import seoRoutes from '../src/routes/seoRoutes'

// Exercise the real HTTP routes without accessing a database or real domain.
test('SEO endpoints require a configured domain and ignore untrusted Host headers', async () => {
  const original = process.env.SITE_URL
  delete process.env.SITE_URL
  const app = express()
  app.use(seoRoutes)
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const address = server.address() as { port: number }
  const base = `http://127.0.0.1:${address.port}`
  try {
    const unavailable = await fetch(`${base}/sitemap.xml`)
    assert.equal(unavailable.status, 503)
    const robots = await fetch(`${base}/robots.txt`)
    assert.equal(await robots.text(), 'User-agent: *\nAllow: /\n')
    process.env.SITE_URL = 'https://example.com/some/path'
    const configured = await fetch(`${base}/robots.txt`, { headers: { Host: 'untrusted.invalid' } })
    assert.equal(
      await configured.text(),
      'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n',
    )
    process.env.SITE_URL = 'not-a-url'
    assert.equal((await fetch(`${base}/sitemap.xml`)).status, 503)
  } finally {
    if (original === undefined) delete process.env.SITE_URL
    else process.env.SITE_URL = original
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    )
  }
})
