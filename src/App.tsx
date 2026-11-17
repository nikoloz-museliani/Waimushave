import { Routes, Route } from 'react-router-dom'
import JobDetails from './components/JobDetails'
import PublicProfile from './components/PublicProfile'
import NavBar from './components/NavBar'
import MainMenu from './components/MainMenu'
import AuthPage from './components/AuthPage'
import PostJob from './components/PostJob'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import "./App.css"

function App() {
  return (
    <>
      <NavBar />
      <main id="main" className="main-content">
        <Routes>
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/people/:id" element={<PublicProfile />} />
          <Route path="/" element={<MainMenu />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/post" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<div className="empty-state"><h1>Page not found</h1><a href="/">Browse jobs</a></div>} />
        </Routes>
      </main>
    </>
  )
}

export default App
