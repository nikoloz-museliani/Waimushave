import { useEffect, useState } from 'react'
import { api } from '../api'
import { usePreferences } from '../context/usePreferences'
import type { Job } from '../types'
import JobCard from './JobCard'
import './JobsPage.css'

// Both screens share the same list behavior. Only the endpoint and available
// actions differ; the route passes an explicit mode rather than hiding tabs.
export default function JobsPage({ mode }: { mode: 'posted' | 'accepted' }) {
  const { t } = usePreferences()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    // Pause polling during a mutation. Cleaning up this effect invalidates older
    // responses, so a slow refresh cannot undo a successful delete/completion.
    if (busy) return
    let active = true
    let fetching = false
    async function load() {
      if (fetching) return
      fetching = true
      try {
        const data = await api<{ jobs: Job[] }>(`/jobs/mine/${mode}`)
        if (active) {
          setJobs(data.jobs)
          setError('')
        }
      } catch {
        if (active) setError('Could not refresh your jobs. Please try again.')
      } finally {
        fetching = false
        if (active) setLoading(false)
      }
    }
    void load()
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load()
    }, 30000)
    window.addEventListener('focus', load)
    return () => {
      active = false
      clearInterval(timer)
      window.removeEventListener('focus', load)
    }
  }, [mode, busy, refresh])

  async function updateJob(job: Job, action: 'delete' | 'complete') {
    if (action === 'delete' && !confirm(t('Delete this job?'))) return
    setBusy(true)
    setError('')
    try {
      await api(`/jobs/${job._id}${action === 'complete' ? '/complete' : ''}`, {
        method: action === 'delete' ? 'DELETE' : 'POST',
      })
      setJobs((previous) =>
        action === 'delete'
          ? previous.filter((item) => item._id !== job._id)
          : previous.map((item) => (item._id === job._id ? { ...item, status: 'done' } : item)),
      )
    } catch {
      setError('Could not update job. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function cards(list: Job[]) {
    return (
      <div className="job-grid">
        {list.map((job) => (
          <JobCard key={job._id} job={job}>
            {mode === 'posted' && job.status === 'open' && (
              <button disabled={busy} onClick={() => updateJob(job, 'delete')}>
                {t('Delete')}
              </button>
            )}
            {job.status === 'in_progress' && (
              <button disabled={busy} onClick={() => updateJob(job, 'complete')}>
                {t('Mark as done')}
              </button>
            )}
          </JobCard>
        ))}
      </div>
    )
  }
  const current = jobs.filter((job) => job.status === 'in_progress')
  const finished = jobs.filter((job) => job.status === 'done')
  return (
    <div className="jobs-page">
      <div className="page-heading">
        <h1>{t(mode === 'posted' ? 'My jobs' : 'Accepted / finished jobs')}</h1>
        <button disabled={busy} onClick={() => setRefresh(refresh + 1)}>
          {t('Refresh jobs')}
        </button>
      </div>
      <p className="refresh-note">{t('Updates every 30 seconds while this page is visible.')}</p>
      {error && (
        <p className="notice" role="alert">
          {t(error)}
        </p>
      )}
      {loading ? (
        <p role="status">{t('Loading…')}</p>
      ) : mode === 'posted' ? (
        <section>
          <h2>{t('Jobs I posted')}</h2>
          {jobs.length ? cards(jobs) : <p>{t('You haven’t posted any jobs yet.')}</p>}
        </section>
      ) : (
        <>
          <section>
            <h2>
              {t('Current jobs')} ({current.length})
            </h2>
            {current.length ? cards(current) : <p>{t('No current jobs.')}</p>}
          </section>
          <section>
            <h2>
              {t('Finished jobs')} ({finished.length})
            </h2>
            {finished.length ? cards(finished) : <p>{t('No finished jobs yet.')}</p>}
          </section>
        </>
      )}
    </div>
  )
}
