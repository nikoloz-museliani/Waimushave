import './AuthPage.css'
import { usePreferences } from '../context/usePreferences'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// One component for both /login and /signup
function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { t } = usePreferences()
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // where to go after auth (set by ProtectedRoute / MainMenu), default home
  const requestedPath = (location.state as { from?: string } | null)?.from
  // Only allow an internal return path. Never trust a redirect supplied by a form/URL.
  const from =
    requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/'

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
      <p className="eyebrow">{t('WELCOME TO WAIMUSHAVE')}</p>
      <h1>{t(mode === 'login' ? 'Log in' : 'Sign up')}</h1>

      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div>
            <label>
              {t('Name')}
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
          </div>
        )}
        <div>
          <label>
            {t('Email')}{' '}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            {t('Password')}{' '}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
        </div>

        {error && (
          <p className="notice" role="alert">
            {t(error)}
          </p>
        )}

        <button className="primary" type="submit" disabled={submitting}>
          {t(mode === 'login' ? 'Log in' : 'Create account')}
        </button>
      </form>

      <p>
        {mode === 'login' ? (
          <>
            {t('No account?')}{' '}
            <Link to="/signup" state={location.state}>
              {t('Sign up')}
            </Link>
          </>
        ) : (
          <>
            {t('Already have an account?')}{' '}
            <Link to="/login" state={location.state}>
              {t('Log in')}
            </Link>
          </>
        )}
      </p>
    </div>
  )
}

export default AuthPage
