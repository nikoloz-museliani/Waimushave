const TOKEN_KEY = 'token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// An error that remembers the HTTP status and (for forms) which field it is about
export class ApiError extends Error {
  status: number
  field?: string

  constructor(message: string, status: number, field?: string) {
    super(message)
    this.status = status
    this.field = field
  }
}

// Keep HTTP mechanics out of components. Every component uses this one wrapper.
// Authorization: Bearer carries the signed JWT; Express verifies it. A browser
// route guard or a user id in React state cannot authorize a database change.
// Small fetch wrapper: adds the login token, handles JSON + FormData, logs what happens.
export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const url = `/api${path}`

  const headers = new Headers(options.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  console.log(`[api] -> ${method} ${url}`, token ? '(with login token)' : '(no token)')

  let res: Response
  try {
    res = await fetch(url, { ...options, headers })
  } catch (err) {
    console.error(`[api] X ${method} ${url} - could not reach the server`, err)
    throw new ApiError(
      'Cannot reach the server. Check your internet connection and that the backend is running.',
      0,
    )
  }

  // read as text first so a non-JSON reply (e.g. an empty proxy error) doesn't crash us
  const text = await res.text()
  let data: { error?: string; field?: string }
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new ApiError('The server returned an invalid response. Please try again.', res.status)
  }

  console.log(
    `[api] <- ${res.status} ${method} ${url}`,
    res.ok ? 'OK' : `ERROR: ${data.error ?? '(no message)'}`,
  )

  if (!res.ok) {
    const message =
      data.error ??
      (res.status >= 500
        ? `The server is not responding properly (status ${res.status}). Make sure the backend is running (npm run dev in the server folder) and check its terminal for errors.`
        : `Request failed (status ${res.status})`)
    throw new ApiError(message, res.status, data.field)
  }

  return data as T
}
