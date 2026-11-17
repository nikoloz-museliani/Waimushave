import { Link, Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import MainMenu from './components/MainMenu'
import AuthPage from './components/AuthPage'
import PostJob from './components/PostJob'
import Profile from './components/Profile'
import JobsPage from './components/JobsPage'
import JobDetails from './components/JobDetails'
import PublicProfile from './components/PublicProfile'
import ProtectedRoute from './components/ProtectedRoute'
import PageMetadata from './components/PageMetadata'
import { usePreferences } from './context/usePreferences'
import './styles/global.css'
import './App.css'

export default function App() {
  const { t } = usePreferences()
  return (
    <>
      <PageMetadata />
      <NavBar />
      <main id="main" className="main-content">
        {/* Public pages can be opened without an account and have normal URLs that
          users can share. React Router switches the screen without reloading. */}
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/people/:id" element={<PublicProfile />} />
          <Route path="/login" element={<AuthPage key="login" mode="login" />} />
          <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
          {/* The frontend guard is only navigation/UX. Express must independently
            verify the signed token and ownership for every private API request. */}
          <Route
            path="/post"
            element={
              <ProtectedRoute>
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Different keys reset list state when switching between these routes. */}
          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute>
                <JobsPage key="posted" mode="posted" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accepted-jobs"
            element={
              <ProtectedRoute>
                <JobsPage key="accepted" mode="accepted" />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="empty-state">
                <h1>{t('Page not found')}</h1>
                <Link to="/">{t('Return home')}</Link>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  )
}
