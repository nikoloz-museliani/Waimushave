import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import { useAuth } from '../context/useAuth'
import { usePreferences } from '../context/usePreferences'
import type { User } from '../types'
import ToggleSwitch from './ToggleSwitch'
import './Profile.css'

// Profile owns account fields and display preferences only. Job management lives
// in JobsPage so editing a name never reloads two unrelated lists of jobs.
export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const { t, theme, setTheme } = usePreferences()
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    city: user?.city ?? '',
    bio: user?.bio ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNotice('')
    try {
      // The backend gets the account id from the signed token, never from a
      // user-editable form field. This prevents editing somebody else's profile.
      const data = await api<{ user: User }>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      setUser(data.user)
      setNotice('Profile saved.')
    } catch {
      setNotice('Could not save profile. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  if (!user) return null
  return (
    <div className="profile-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t('YOUR ACCOUNT')}</p>
          <h1>{t('Profile')}</h1>
          <p className="muted">{user.email}</p>
        </div>
        <button onClick={logout}>{t('Log out')}</button>
      </div>
      <section className="panel appearance-panel">
        <div>
          <h2>{t('Appearance')}</h2>
          <p className="muted">{t('Saved on this device.')}</p>
        </div>
        <ToggleSwitch
          label={t('Dark mode')}
          left={t('Light')}
          right={t('Dark')}
          checked={theme === 'dark'}
          onChange={(dark) => setTheme(dark ? 'dark' : 'light')}
        />
      </section>
      <form className="panel profile-editor" onSubmit={save}>
        <h2>{t('Your details')}</h2>
        <label>
          {t('Name')}
          <input
            required
            maxLength={80}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoComplete="name"
          />
        </label>
        <label>
          {t('Phone')}
          <input
            type="tel"
            maxLength={40}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            autoComplete="tel"
          />
        </label>
        <label>
          {t('City')}
          <input
            maxLength={80}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            autoComplete="address-level2"
          />
        </label>
        <label>
          {t('Bio')}
          <textarea
            rows={4}
            maxLength={1000}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </label>
        {notice && (
          <p className="notice" role="status">
            {t(notice)}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {t(busy ? 'Saving…' : 'Save changes')}
        </button>
      </form>
    </div>
  )
}
