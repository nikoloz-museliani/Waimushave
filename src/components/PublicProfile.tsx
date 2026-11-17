import './PublicProfile.css'
import { usePreferences } from '../context/usePreferences'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
export default function PublicProfile() {
  const { t } = usePreferences()
  const { id } = useParams()
  const [person, setPerson] = useState<{ name: string; city?: string; bio?: string } | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    api<{ user: { name: string; city?: string; bio?: string } }>(`/users/${id}`)
      .then((data) => {
        if (active) setPerson(data.user)
      })
      .catch(() => {
        if (active) setError('This profile is unavailable.')
      })
    return () => {
      active = false
    }
  }, [id])
  return (
    <div className="public-profile">
      <Link className="back-link" to="/my-jobs">
        {t('← My jobs')}
      </Link>
      {error && <p role="alert">{t(error)}</p>}
      {person ? (
        <section className="panel">
          <span className="avatar">{person.name.slice(0, 1).toUpperCase()}</span>
          <h1>{person.name}</h1>
          <p className="muted">{person.city || t('City not added')}</p>
          <p className="description">{person.bio || t('This person hasn’t added a bio yet.')}</p>
          <p className="muted">
            {t('This is a self-reported profile, not an identity verification.')}
          </p>
        </section>
      ) : (
        !error && <p>{t('Loading profile…')}</p>
      )}
    </div>
  )
}
