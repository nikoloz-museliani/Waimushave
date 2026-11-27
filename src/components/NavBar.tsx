import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePreferences } from '../context/usePreferences'
import ToggleSwitch from './ToggleSwitch'
import './navbar.css'

export default function NavBar() {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = usePreferences()
  const navigate = useNavigate()
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        {t('Skip to content')}
      </a>
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Waimushave">
          <span className="brand-mark">w</span>waimushave<span className="country">GE</span>
        </Link>
        <span className="topbar-note">{t('Local jobs. Real people.')}</span>
        <div className="header-actions">
          <ToggleSwitch
            left="GEO"
            right="ENG"
            checked={language === 'en'}
            onChange={(english) => setLanguage(english ? 'en' : 'ka')}
            label={t('English language')}
          />
          <Link className="button primary" to="/post">
            + {t('Post a job')}
          </Link>
          {user ? (
            <button
              className="avatar"
              onClick={() => navigate('/profile')}
              aria-label={t('Open your profile')}
            >
              {user.name.slice(0, 1).toUpperCase()}
            </button>
          ) : (
            <Link className="button" to="/login">
              {t('Log in')}
            </Link>
          )}
        </div>
      </header>
      <nav className="sidebar" aria-label={t('Main navigation')}>
        <NavLink to="/" end>
          <span aria-hidden="true">⌕</span>
          {t('Browse jobs')}
        </NavLink>
        <NavLink to="/my-jobs">
          <span aria-hidden="true">▤</span>
          {t('My jobs')}
        </NavLink>
        <NavLink to="/accepted-jobs">
          <span aria-hidden="true">✓</span>
          <span className="nav-label-desktop">{t('Accepted / finished jobs')}</span>
          <span className="nav-label-mobile">{t('Accepted jobs')}</span>
        </NavLink>
        <NavLink className="post-nav-link" to="/post">
          <span aria-hidden="true">＋</span>
          {t('Post a job')}
        </NavLink>
        <div className="sidebar-bottom">
          <p>
            {t('Find a little help.')}
            <br />
            {t('Find your next job.')}
          </p>
          <small>{t('Made for Georgia')}</small>
          {user && (
            <button
              className="text-button"
              onClick={() => {
                logout()
                navigate('/')
              }}
            >
              {t('Log out')}
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
