import { AuthContext } from './useAuth'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api, ApiError, getToken, setToken } from '../api'
import type { User } from '../types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // only "loading" if there's a saved token we need to verify
  const [loading, setLoading] = useState(!!getToken())

  useEffect(() => {
    if (!getToken()) return
    // A stored token is not proof of a valid session. Ask the server to verify
    // its signature/expiry and look up the account before showing private pages.
    let active = true
    api<{ user: User }>('/auth/me')
      .then((data) => {
        if (active) setUser(data.user)
      })
      .catch((error: unknown) => {
        if (active && error instanceof ApiError && error.status === 401) setToken(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Login/signup return a signed JWT and the safe public user fields. The token
  // is stored once; api.ts adds it to later requests. No password is stored here.
  // localStorage preserves the existing API contract; HttpOnly cookie sessions
  // are a future security upgrade, not something to silently mix into this flow.
  async function login(email: string, password: string) {
    const data = await api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(data.token)
    setUser(data.user)
  }

  async function signup(name: string, email: string, password: string) {
    const data = await api<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    setToken(data.token)
    setUser(data.user)
  }

  // Local logout forgets this browser’s token. It does not revoke copied JWTs;
  // server-side revocation would require a session store or token version field.
  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
