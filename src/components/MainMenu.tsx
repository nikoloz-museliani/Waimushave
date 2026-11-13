import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import JobCard from './JobCard'
import type { Job } from '../types'

function MainMenu() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [mode, setMode] = useState<'choose' | 'find'>('choose')
  const [jobs, setJobs] = useState<Job[]>([])
  const [city, setCity] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadJobs() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (city.trim()) params.set('city', city.trim())
      if (search.trim()) params.set('q', search.trim())
      const data = await api<{ jobs: Job[] }>(`/jobs?${params}`)
      setJobs(data.jobs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  function startFinding() {
    setMode('find')
    loadJobs()
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    loadJobs()
  }

  async function handleAccept(id: string) {
    if (!user) {
      navigate('/login', { state: { from: '/' } })
      return
    }
    setError('')
    try {
      await api(`/jobs/${id}/accept`, { method: 'POST' })
      setJobs((prev) => prev.filter((j) => j._id !== id))
      setNotice('Job accepted! You can find it (with contact details) in your profile.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept job')
    }
  }

  if (mode === 'choose') {
    return (
      <div>
        <h1>What would you like to do?</h1>
        <button onClick={startFinding}>I'm looking for a job</button>{' '}
        {/* /post is protected: logged-out users are sent to login first, then to /post */}
        <button onClick={() => navigate('/post')}>I want to post a job</button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => { setMode('choose'); setNotice('') }}>Back</button>
      <h1>Available jobs</h1>

      <form onSubmit={handleSearch}>
        <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />{' '}
        <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />{' '}
        <button type="submit">Search</button>
      </form>

      {notice && <p>{notice}</p>}
      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && jobs.length === 0 && <p>No jobs found.</p>}

      {jobs.map((job) => (
        <JobCard key={job._id} job={job}>
          {user?._id === job.postedBy._id ? (
            <p>This is your job.</p>
          ) : (
            <button onClick={() => handleAccept(job._id)}>Accept job</button>
          )}
        </JobCard>
      ))}
    </div>
  )
}

export default MainMenu
