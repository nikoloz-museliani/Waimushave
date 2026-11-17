import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// One component for both /login and /signup
function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // where to go after auth (set by ProtectedRoute / MainMenu), default home
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') await login(email, password)
      else await signup(name, email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page panel">
      <p className="eyebrow">WELCOME TO WAIMUSHAVE</p>
      <h1>{mode === 'login' ? 'Log in' : 'Sign up'}</h1>

      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div>
            <label>
              Name <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
          </div>
        )}
        <div>
          <label>
            Email{' '}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Password{' '}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
        </div>

        {error && <p className="notice" role="alert">{error}</p>}

        <button className="primary" type="submit" disabled={submitting}>
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>

      <p>
        {mode === 'login' ? (
          <>No account? <Link to="/signup" state={location.state}>Sign up</Link></>
        ) : (
          <>Already have an account? <Link to="/login" state={location.state}>Log in</Link></>
        )}
      </p>
    </div>
  )
}

export default AuthPage
