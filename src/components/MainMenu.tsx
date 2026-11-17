import './MainMenu.css'
import { usePreferences } from '../context/usePreferences'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/useAuth'
import JobCard from './JobCard'
import type { Job } from '../types'
const categories = [
  'All',
  'Cleaning',
  'Repairs',
  'Moving',
  'Delivery',
  'Gardening',
  'Painting',
  'Tutoring',
  'Other',
]
export default function MainMenu() {
  const { t } = usePreferences()
  const { user, loading: authLoading } = useAuth()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [city, setCity] = useState(params.get('city') ?? '')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [retry, setRetry] = useState(0)
  const page = Number(params.get('page') ?? 1)
  const category = params.get('category') ?? 'All'
  const query = params.toString()
  useEffect(() => {
    if (authLoading) return
    let active = true
    api<{ jobs: Job[]; hasMore: boolean }>(`/jobs?${query}`)
      .then((data) => {
        if (active) {
          setJobs(data.jobs)
          setHasMore(data.hasMore)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('We couldn’t load the jobs. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [query, user?._id, authLoading, retry])
  function change(next: URLSearchParams) {
    setLoading(true)
    setParams(next)
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t('WORK, CLOSE TO HOME')}</p>
          <h1>{t('Find your next job')}</h1>
          <p className="muted">{t('A helping hand. A useful skill. An opportunity nearby.')}</p>
        </div>
        <Link className="quiet-link" to="/post">
          {t('Need someone? Post a job →')}
        </Link>
      </div>
      <form
        className="search-bar"
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          const next = new URLSearchParams(params)
          next.delete('page')
          if (search.trim()) next.set('q', search.trim())
          else next.delete('q')
          if (city.trim()) next.set('city', city.trim())
          else next.delete('city')
          change(next)
        }}
      >
        <label className="search-field">
          <span className="sr-only">{t('Search jobs')}</span>
          <span aria-hidden="true">{t('⌕')}</span>
          <input
            placeholder={t('Search jobs or skills')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={200}
          />
        </label>
        <label className="city-field">
          <span className="sr-only">{t('City')}</span>
          <input
            placeholder={t('All cities')}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            maxLength={80}
          />
        </label>
        <button className="primary" type="submit">
          {t('Search')}
        </button>
      </form>
      <div className="categories" aria-label={t('Job categories')}>
        {categories.map((name) => (
          <button
            key={name}
            aria-pressed={category === name}
            className={category === name ? 'selected' : ''}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.delete('page')
              if (name === 'All') next.delete('category')
              else next.set('category', name)
              change(next)
            }}
          >
            {t(name)}
          </button>
        ))}
      </div>
      <div className="section-heading">
        <h2>{t(category === 'All' ? 'Available jobs' : category)}</h2>
        <span className="muted">{t('Newest first · Georgia')}</span>
      </div>
      {loading || authLoading ? (
        <div className="empty-state" role="status">
          {t('Loading available jobs…')}
        </div>
      ) : error ? (
        <div className="empty-state" role="alert">
          <h2>{t('Let’s try that again')}</h2>
          <p>{t(error)}</p>
          <button
            onClick={() => {
              setLoading(true)
              setRetry(retry + 1)
            }}
          >
            {t('Retry')}
          </button>
        </div>
      ) : jobs.length ? (
        <div className="job-grid">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} compact />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{t('No jobs here yet')}</h2>
          <p>{t('Try another city or category, or post the first job.')}</p>
          <Link className="button" to="/post">
            {t('Post a job')}
          </Link>
        </div>
      )}
      {!loading && !error && (page > 1 || hasMore) && (
        <div className="pagination">
          <button
            disabled={page <= 1}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('page', String(page - 1))
              change(next)
            }}
          >
            {t('Previous')}
          </button>
          <span>
            {t('Page')} {page}
          </span>
          <button
            disabled={!hasMore}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('page', String(page + 1))
              change(next)
            }}
          >
            {t('Next')}
          </button>
        </div>
      )}
    </>
  )
}
