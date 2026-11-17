import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import { useAuth } from '../context/useAuth'
import JobCard from './JobCard'
import type { Job, User } from '../types'

type Tab = 'posted' | 'accepted'

function Profile() {
  const { user, setUser, logout } = useAuth()

  const [tab, setTab] = useState<Tab>('posted')
  const [posted, setPosted] = useState<Job[]>([])
  const [accepted, setAccepted] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [busy, setBusy] = useState(false)
  const mutationVersion = useRef(0)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    city: user?.city ?? '',
    bio: user?.bio ?? '',
  })

  useEffect(() => {
    let active = true
    let fetching = false
    async function load() {
      if (fetching) return
      fetching = true
      const version = mutationVersion.current
      try {
        const [p, a] = await Promise.all([api<{ jobs: Job[] }>('/jobs/mine/posted'), api<{ jobs: Job[] }>('/jobs/mine/accepted')])
        if (active && version === mutationVersion.current) { setPosted(p.jobs); setAccepted(a.jobs); setError('') }
      } catch { if (active) setError('Could not refresh your jobs. Please try again.') }
      finally { fetching = false; if (active) setLoading(false) }
    }
    void load()
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load() }, 30000)
    window.addEventListener('focus', load)
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', load) }
  }, [refresh])

  function replaceJob(updated: Job) {
    const swap = (list: Job[]) => list.map((j) => (j._id === updated._id ? updated : j))
    setPosted(swap)
    setAccepted(swap)
  }

  async function markDone(id: string) {
    setError('')
    setBusy(true)
    mutationVersion.current++
    try {
      const data = await api<{ job: Job }>(`/jobs/${id}/complete`, { method: 'POST' })
      replaceJob(data.job)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update job')
    } finally { mutationVersion.current++; setBusy(false) }
  }

  async function deleteJob(id: string) {
    if (!confirm('Delete this job?')) return
    setError('')
    setBusy(true)
    mutationVersion.current++
    try {
      await api(`/jobs/${id}`, { method: 'DELETE' })
      setPosted((prev) => prev.filter((j) => j._id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete job')
    } finally { mutationVersion.current++; setBusy(false) }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    mutationVersion.current++
    try {
      const data = await api<{ user: User }>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      setUser(data.user)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
    } finally { mutationVersion.current++; setBusy(false) }
  }

  if (!user) return null

  const current = accepted.filter((j) => j.status === 'in_progress')
  const done = accepted.filter((j) => j.status === 'done')

  return (
    <div>
      <div className="page-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>Profile</h1><p className="muted">Manage your listings and the jobs you’ve accepted.</p></div><button disabled={busy} onClick={() => setRefresh(refresh + 1)}>Refresh jobs</button></div>
      <p className="refresh-note">Updates every 30 seconds while this page is visible. Accepted workers appear on your posted jobs below.</p>

      {editing ? (
        <form className="panel profile-editor" onSubmit={saveProfile}>
          <div>
            <label>Name <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          </div>
          <div>
            <label>Phone <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          </div>
          <div>
            <label>City <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
          </div>
          <div>
            <label>
              Bio
              <br />
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} cols={40} />
            </label>
          </div>
          <button disabled={busy} type="submit">Save</button>{' '}
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : (
        <div className="panel profile-summary">
          <h2>Your profile</h2>
          <button className="profile-logout" onClick={logout}>Log out</button>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone || '-'}</p>
          <p>City: {user.city || '-'}</p>
          <p>Bio: {user.bio || '-'}</p>
          <button onClick={() => setEditing(true)}>Edit profile</button>
        </div>
      )}

      <div className="tabs" role="group" aria-label="Job lists">

      {/* the two buttons swap which section is shown */}
      <button onClick={() => setTab('posted')} disabled={tab === 'posted'}>
        Posted jobs ({posted.length})
      </button>{' '}
      <button onClick={() => setTab('accepted')} disabled={tab === 'accepted'}>
        Accepted / done jobs ({accepted.length})
      </button>

      </div>
      {error && <p className="notice" role="alert">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && tab === 'posted' && (
        <section>
          <h2>Jobs I posted</h2>
          {posted.length === 0 && <p>You haven't posted any jobs yet.</p>}
          <div className="job-grid">{posted.map((job) => (
            <JobCard key={job._id} job={job}>
              {job.status === 'open' && <button disabled={busy} onClick={() => deleteJob(job._id)}>Delete</button>}
              {job.status === 'in_progress' && <button disabled={busy} onClick={() => markDone(job._id)}>Mark as done</button>}
            </JobCard>
          ))}</div>
        </section>
      )}

      {!loading && tab === 'accepted' && (
        <section>
          <h2>Current jobs</h2>
          {current.length === 0 && <p>No current jobs.</p>}
          <div className="job-grid">{current.map((job) => (
            <JobCard key={job._id} job={job}>
              <button disabled={busy} onClick={() => markDone(job._id)}>Mark as done</button>
            </JobCard>
          ))}</div>

          <h2>Done jobs</h2>
          {done.length === 0 && <p>No finished jobs yet.</p>}
          <div className="job-grid">{done.map((job) => <JobCard key={job._id} job={job} />)}</div>
        </section>
      )}
    </div>
  )
}

export default Profile
