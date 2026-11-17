import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="topbar">
      <Link className="brand" to="/" aria-label="Waimushave home"><span className="brand-mark">w</span>waimushave<span className="country">GE</span></Link>
      <span className="topbar-note">Local jobs. Real people.</span>
      <div className="header-actions"><Link className="button primary" to="/post">+ Post a job</Link>{user ? <button className="avatar" onClick={() => navigate('/profile')} aria-label="Open your profile">{user.name.slice(0, 1).toUpperCase()}</button> : <Link className="button" to="/login">Log in</Link>}</div>
    </header>
    <nav className="sidebar" aria-label="Main navigation">
      <NavLink to="/" end><span aria-hidden="true">⌕</span>Browse jobs</NavLink>
      <NavLink to="/profile"><span aria-hidden="true">▤</span>Profile</NavLink>
      <NavLink to="/post"><span aria-hidden="true">＋</span>Post a job</NavLink>
      <div className="sidebar-bottom"><p>Find a little help.<br />Find your next job.</p><small>Made for Georgia</small>{user && <button className="text-button" onClick={() => { logout(); navigate('/') }}>Log out</button>}</div>
    </nav>
  </>
}
