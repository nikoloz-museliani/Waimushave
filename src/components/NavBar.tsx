import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/">Waimushave</Link>

      <div>
        {user ? (
          <>
            <Link to="/post">Post a job</Link>{' '}
            <Link to="/profile">{user.name}</Link>{' '}
            <button onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>Log in</button>{' '}
            <button onClick={() => navigate('/signup')}>Sign up</button>
          </>
        )}
      </div>
    </nav>
  )
}

export default NavBar
