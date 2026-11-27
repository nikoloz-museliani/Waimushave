import './ProtectedRoute.css'
import { IS_DEMO } from '../config'
import DemoNotice from './DemoNotice'
import { usePreferences } from '../context/usePreferences'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// This guard only controls which screen is visible. It is NOT the security boundary.
// The server independently validates JWTs and resource ownership.
// Wrap any page that needs a login. Not logged in -> /login, then back to the page they wanted.
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { t } = usePreferences()
  const { user, loading } = useAuth()
  const location = useLocation()

  // Wait for /auth/me before redirecting, otherwise a reload briefly sends a
  // legitimately signed-in user to the login form.
  if (IS_DEMO) return <DemoNotice blocked />
  if (loading) return <p>{t('Loading...')}</p>
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <>{children}</>
}

export default ProtectedRoute
