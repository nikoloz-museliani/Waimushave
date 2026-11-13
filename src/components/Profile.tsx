import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import JobCard from './JobCard'
import type { Job, User } from '../types'

type Tab = 'posted' | 'accepted'

function Profile() {
  const { user, setUser } = useAuth()

  const [tab, setTab] = useState<Tab>('posted')
  const [posted, setPosted] = useState<Job[]>([])
  const [accepted, setAccepted] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    city: user?.city ?? '',
    bio: user?.bio ?? '',
  })

  useEffect(() => {
    Promise.all([
      api<{ jobs: Job[] }>('/jobs/mine/posted'),
      api<{ jobs: Job[] }>('/jobs/mine/accepted'),
    ])
      .then(([p, a]) => {
        setPosted(p.jobs)
        setAccepted(a.jobs)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load jobs'))
      .finally(() => setLoading(false))
  }, [])

  function replaceJob(updated: Job) {
    const swap = (list: Job[]) => list.map((j) => (j._id === updated._id ? updated : j))
    setPosted(swap)
    setAccepted(swap)
  }

  async function markDone(id: string) {
    setError('')
    try {
      const data = await api<{ job: Job }>(`/jobs/${id}/complete`, { method: 'POST' })
      replaceJob(data.job)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update job')
    }
  }

  async function deleteJob(id: string) {
    if (!confirm('Delete this job?')) return
    setError('')
    try {
      await api(`/jobs/${id}`, { method: 'DELETE' })
      setPosted((prev) => prev.filter((j) => j._id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete job')
    }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const data = await api<{ user: User }>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      setUser(data.user)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
    }
  }

  if (!user) return null

  const current = accepted.filter((j) => j.status === 'in_progress')
  const done = accepted.filter((j) => j.status === 'done')

  return (
    <div>
      <h1>Profile</h1>

      {editing ? (
        <form onSubmit={saveProfile}>
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
          <button type="submit">Save</button>{' '}
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone || '-'}</p>
          <p>City: {user.city || '-'}</p>
          <p>Bio: {user.bio || '-'}</p>
          <button onClick={() => setEditing(true)}>Edit profile</button>
        </div>
      )}

      <hr />

      {/* the two buttons swap which section is shown */}
      <button onClick={() => setTab('posted')} disabled={tab === 'posted'}>
        Posted jobs ({posted.length})
      </button>{' '}
      <button onClick={() => setTab('accepted')} disabled={tab === 'accepted'}>
        Accepted / done jobs ({accepted.length})
      </button>

      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && tab === 'posted' && (
        <section>
          <h2>Jobs I posted</h2>
          {posted.length === 0 && <p>You haven't posted any jobs yet.</p>}
          {posted.map((job) => (
            <JobCard key={job._id} job={job}>
              {job.status === 'open' && <button onClick={() => deleteJob(job._id)}>Delete</button>}
              {job.status === 'in_progress' && <button onClick={() => markDone(job._id)}>Mark as done</button>}
            </JobCard>
          ))}
        </section>
      )}

      {!loading && tab === 'accepted' && (
        <section>
          <h2>Current jobs</h2>
          {current.length === 0 && <p>No current jobs.</p>}
          {current.map((job) => (
            <JobCard key={job._id} job={job}>
              <button onClick={() => markDone(job._id)}>Mark as done</button>
            </JobCard>
          ))}

          <h2>Done jobs</h2>
          {done.length === 0 && <p>No finished jobs yet.</p>}
          {done.map((job) => <JobCard key={job._id} job={job} />)}
        </section>
      )}
    </div>
  )
}

export default Profile
