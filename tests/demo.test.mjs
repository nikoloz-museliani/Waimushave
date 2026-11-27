import { test } from 'node:test'
import assert from 'node:assert/strict'
import { demoJobs, readDemoRequest } from '../src/demoJobs.ts'

test('browse has pagination and stable job details', () => {
  const first = readDemoRequest('/jobs')
  const second = readDemoRequest('/jobs?page=2')
  assert.equal(first.jobs.length, 8)
  assert.equal(first.hasMore, true)
  assert.equal(second.jobs.length, 8)
  assert.equal(second.hasMore, true)
  assert.equal(demoJobs.length, 20)
  assert.equal(readDemoRequest('/jobs?page=3').jobs.length, 4)
  assert.equal(readDemoRequest('/jobs?page=3').hasMore, false)
  assert.equal(readDemoRequest('/jobs/demo-job-1').job._id, 'demo-job-1')
})
test('search, category and Georgian city filters combine', () => {
  assert.equal(readDemoRequest('/jobs?q=clean&city=თბილისი&category=Cleaning').jobs.length, 1)
  assert.equal(readDemoRequest('/jobs?q=nonexistent').jobs.length, 0)
})
test('reject writes, private endpoints and missing jobs', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.throws(() => readDemoRequest('/jobs', method))
  }
  for (const path of ['/auth/me', '/jobs/mine/posted', '/jobs/demo-job-999', '/jobs?page=NaN']) {
    assert.throws(() => readDemoRequest(path))
  }
})
test('callers cannot mutate shared samples and samples have no contacts/uploads', () => {
  readDemoRequest('/jobs/demo-job-1').job.title = 'Changed'
  assert.notEqual(readDemoRequest('/jobs/demo-job-1').job.title, 'Changed')
  assert.ok(demoJobs.every((job) => !job.email && !job.phone && job.images.length === 0))
})

// Exercise the real API wrapper in each build mode without making HTTP requests.
// TypeScript transpilation here only supplies the build-time flag normally supplied by Vite.
async function loadApi(demo) {
  const { readFile } = await import('node:fs/promises')
  const ts = await import('typescript')
  const source = (await readFile(new URL('../src/api.ts', import.meta.url), 'utf8'))
    .replace("import { IS_DEMO } from './config'", `const IS_DEMO = ${demo}`)
    .replace(
      "import('./demoJobs')",
      `import('${new URL('../src/demoJobs.ts', import.meta.url).href}')`,
    )
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
  }).outputText
  return import(`data:text/javascript;charset=utf-8,${encodeURIComponent(compiled)}`)
}

test('demo API never fetches or touches saved tokens, including rejected writes', async (t) => {
  t.mock.method(globalThis, 'fetch', () => {
    throw new Error('Unexpected network request')
  })
  const api = await loadApi(true)
  assert.equal(api.getToken(), null)
  api.setToken(null)
  assert.equal((await api.api('/jobs')).jobs.length, 8)
  await assert.rejects(api.api('/auth/me'), api.ApiError)
  await assert.rejects(api.api('/jobs', { method: 'POST' }), api.ApiError)
  assert.equal(globalThis.fetch.mock.callCount(), 0)
})

test('normal API preserves server path, token and JSON handling', async (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => 'test-token' },
  })
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  })
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/jobs')
    assert.equal(options.headers.get('Authorization'), 'Bearer test-token')
    assert.equal(options.headers.get('Content-Type'), 'application/json')
    return new Response(JSON.stringify({ job: { _id: 'server-job' } }), { status: 201 })
  })
  const api = await loadApi(false)
  assert.equal((await api.api('/jobs', { method: 'POST', body: '{}' })).job._id, 'server-job')
  assert.equal(globalThis.fetch.mock.callCount(), 1)
})
