import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Job, JobStatus } from '../types'
const labels: Record<JobStatus, string> = { open: 'Open', in_progress: 'In progress', done: 'Completed' }
export default function JobCard({ job, children, compact = false }: { job: Job; children?: ReactNode; compact?: boolean }) {
  const hasPin = job.location?.lat != null && job.location?.lng != null
  return <article className={`job-card ${compact ? 'compact' : 'full'}`}>
    <Link className="job-cover" to={`/jobs/${job._id}`} aria-label={`View ${job.title}`}>
      {job.images[0] ? <img src={job.images[0]} alt={job.title} loading="lazy" /> : <div className="cover-placeholder"><span aria-hidden="true">{job.category.slice(0, 1)}</span><span>{job.category}</span></div>}
      <span className="price-tag">{job.price.toLocaleString()} {job.currency}{job.priceType === 'hourly' ? ' / hr' : ''}</span>
    </Link>
    <div className="job-body"><div className="job-meta"><span>{job.category}</span><span className="status">{labels[job.status]}</span></div>
      <h3><Link to={`/jobs/${job._id}`}>{job.title}</Link></h3><p className="muted">{job.city} · {new Date(job.createdAt).toLocaleDateString()}</p>
      {!compact && <><p className="description">{job.description}</p><p>{job.street}, {job.city} {hasPin && <a href={`https://www.google.com/maps?q=${job.location!.lat},${job.location!.lng}`} target="_blank" rel="noreferrer">View map ↗</a>}</p>{job.startDate && <p>Needed on {new Date(job.startDate).toLocaleDateString()}</p>}
      {job.images.length > 1 && <div className="photo-strip">{job.images.slice(1).map((src, i) => <a key={src} href={src} target="_blank" rel="noreferrer"><img src={src} alt={`${job.title}, photo ${i + 2}`} loading="lazy" /></a>)}</div>}
      <div className="contact-row">{job.phone && <a className="button" href={`tel:${job.phone}`}>Call poster</a>}{job.email && <a className="button" href={`mailto:${job.email}`}>Email poster</a>}{!job.phone && !job.email && <Link to="/login" state={{ from: `/jobs/${job._id}` }}>Log in to see contact details</Link>}</div></>}
      <div className="person-line"><span className="avatar small">{(job.postedBy?.name ?? '?').slice(0, 1).toUpperCase()}</span><span>{job.postedBy?.name ?? 'Account unavailable'}</span></div>
      {job.acceptedBy && <div className="accepted-person"><span className="eyebrow">ACCEPTED BY</span><strong>{job.acceptedBy.name}</strong><Link to={`/people/${job.acceptedBy._id}`}>View profile →</Link></div>}
      {children && <div className="card-actions">{children}</div>}
    </div>
  </article>
}
