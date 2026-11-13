import type { ReactNode } from 'react'
import type { Job, JobStatus } from '../types'

const STATUS_LABEL: Record<JobStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  done: 'Done',
}

// Shows one job. Pass buttons (Accept, Delete, Mark done...) as children.
function JobCard({ job, children }: { job: Job; children?: ReactNode }) {
  const hasPin = job.location?.lat != null && job.location?.lng != null

  return (
    <article>
      <h3>{job.title}</h3>
      <p>Status: {STATUS_LABEL[job.status]}</p>
      <p>
        Category: {job.category} | Price: {job.price} {job.currency}
        {job.priceType === 'hourly' ? ' / hour' : ''}
      </p>
      <p>
        Location: {job.street}, {job.city}{' '}
        {hasPin && (
          <a
            href={`https://www.google.com/maps?q=${job.location!.lat},${job.location!.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            (open in Google Maps)
          </a>
        )}
      </p>
      {job.startDate && <p>Needed on: {new Date(job.startDate).toLocaleDateString()}</p>}

      <p>{job.description}</p>

      {job.images.length > 0 && (
        <div>
          {job.images.map((src) => (
            <img key={src} src={src} alt="" width={150} />
          ))}
        </div>
      )}

      {job.phone || job.email ? (
        <p>
          Contact: <a href={`tel:${job.phone}`}>{job.phone}</a> |{' '}
          <a href={`mailto:${job.email}`}>{job.email}</a>
        </p>
      ) : (
        <p>Log in to see contact details.</p>
      )}

      <p>
        Posted by {job.postedBy?.name ?? 'unknown'} on {new Date(job.createdAt).toLocaleDateString()}
        {job.acceptedBy ? ` | Accepted by ${job.acceptedBy.name}` : ''}
      </p>

      {children}
      <hr />
    </article>
  )
}

export default JobCard
