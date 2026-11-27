import './JobCard.css'
import { IS_DEMO } from '../config'
import { usePreferences } from '../context/usePreferences'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Job, JobStatus } from '../types'
const labels: Record<JobStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  done: 'Completed',
}
export default function JobCard({
  job,
  children,
  compact = false,
}: {
  job: Job
  children?: ReactNode
  compact?: boolean
}) {
  const { t, locale } = usePreferences()
  const hasPin = job.location?.lat != null && job.location?.lng != null
  return (
    <article className={`job-card ${compact ? 'compact' : 'full'}`}>
      <Link className="job-cover" to={`/jobs/${job._id}`} aria-label={`${t('View')} ${job.title}`}>
        {job.images[0] ? (
          <img src={job.images[0]} alt={job.title} loading="lazy" />
        ) : (
          <div className="cover-placeholder">
            <span aria-hidden="true">{t(job.category).slice(0, 1)}</span>
            <span>{t(job.category)}</span>
          </div>
        )}
        <span className="price-tag">
          {job.price.toLocaleString(locale)} {job.currency}
          {job.priceType === 'hourly' ? ` / ${t('Per hour')}` : ''}
        </span>
      </Link>
      <div className="job-body">
        <div className="job-meta">
          <span>{t(job.category)}</span>
          <span className="status">{t(labels[job.status])}</span>
        </div>
        <h3>
          <Link to={`/jobs/${job._id}`}>{job.title}</Link>
        </h3>
        <p className="muted">
          {job.city}
          {' · '}
          {new Date(job.createdAt).toLocaleDateString(locale)}
        </p>
        {!compact && (
          <>
            <p className="description">{job.description}</p>
            <p>
              {job.street}
              {', '}
              {job.city}{' '}
              {hasPin && (
                <a
                  href={`https://www.google.com/maps?q=${job.location!.lat},${job.location!.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('View map ↗')}
                </a>
              )}
            </p>
            {job.startDate && (
              <p>
                {t('Needed on')} {new Date(job.startDate).toLocaleDateString(locale)}
              </p>
            )}
            {job.images.length > 1 && (
              <div className="photo-strip">
                {job.images.slice(1).map((src, i) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt={`${job.title}, ${t('Photo')} ${i + 2}`} loading="lazy" />
                  </a>
                ))}
              </div>
            )}
            {!IS_DEMO && (
              <div className="contact-row">
                {job.phone && (
                  <a className="button" href={`tel:${job.phone}`}>
                    {t('Call poster')}
                  </a>
                )}
                {job.email && (
                  <a className="button" href={`mailto:${job.email}`}>
                    {t('Email poster')}
                  </a>
                )}
                {!job.phone && !job.email && (
                  <Link to="/login" state={{ from: `/jobs/${job._id}` }}>
                    {t('Log in to see contact details')}
                  </Link>
                )}
              </div>
            )}
          </>
        )}
        <div className="person-line">
          <span className="avatar small">
            {(job.postedBy?.name ?? '?').slice(0, 1).toUpperCase()}
          </span>
          <span>{job.postedBy?.name ?? t('Account unavailable')}</span>
        </div>
        {job.acceptedBy && (
          <div className="accepted-person">
            <span className="eyebrow">{t('ACCEPTED BY')}</span>
            <strong>{job.acceptedBy.name}</strong>
            <Link to={`/people/${job.acceptedBy._id}`}>{t('View profile →')}</Link>
          </div>
        )}
        {children && <div className="card-actions">{children}</div>}
      </div>
    </article>
  )
}
