import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import MainMenu from './components/MainMenu'
import AuthPage from './components/AuthPage'
import PostJob from './components/PostJob'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/post" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  )
}

export default App
