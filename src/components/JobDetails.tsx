import './JobDetails.css'
import { IS_DEMO } from '../config'
import { usePreferences } from '../context/usePreferences'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/useAuth'
import type { Job } from '../types'
import JobCard from './JobCard'
export default function JobDetails() {
  const { t } = usePreferences()
  const { id } = useParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (loading) return
    let active = true
    api<{ job: Job }>(`/jobs/${id}`)
      .then((data) => {
        if (active) setJob(data.job)
      })
      .catch(() => {
        if (active) setError('This job could not be loaded. It may have been removed.')
      })
    return () => {
      active = false
    }
  }, [id, user?._id, loading])
  async function accept() {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } })
      return
    }
    setBusy(true)
    setError('')
    try {
      const data = await api<{ job: Job }>(`/jobs/${id}/accept`, { method: 'POST' })
      setJob(data.job)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept this job')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="detail-page">
      <Link className="back-link" to="/">
        {t('← Browse jobs')}
      </Link>
      {error && (
        <p className="notice" role="alert">
          {t(error)}
        </p>
      )}
      {job ? (
        <JobCard job={job}>
          {IS_DEMO && <p>{t('Portfolio demo: accepting jobs is disabled.')}</p>}
          {!IS_DEMO &&
            job.status === 'open' &&
            (user?._id === job.postedBy?._id ? (
              <Link className="button" to="/my-jobs">
                {t('Manage in My jobs')}
              </Link>
            ) : (
              <>
                <p className="muted">
                  {t(
                    'Accepting assigns this job to you immediately. Check the details before you commit.',
                  )}
                </p>
                <button className="primary" onClick={accept} disabled={busy}>
                  {t(busy ? 'Accepting…' : 'Accept this job')}
                </button>
              </>
            ))}
          {user && job.acceptedBy?._id === user._id && (
            <p role="status">
              {t('You accepted this job.')}
              <Link to="/accepted-jobs">{t('Open My jobs →')}</Link>
            </p>
          )}
        </JobCard>
      ) : (
        !error && <p role="status">{t('Loading job…')}</p>
      )}
    </div>
  )
}
