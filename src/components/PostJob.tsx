import './PostJob.css'
import { usePreferences } from '../context/usePreferences'
import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/useAuth'
import LocationPicker from './LocationPicker'
import type { LatLng } from '../types'

const MAX_IMAGES = 6
const CATEGORIES = [
  'Cleaning',
  'Repairs',
  'Moving',
  'Delivery',
  'Gardening',
  'Painting',
  'Tutoring',
  'Other',
]
const CURRENCIES = ['GEL', 'USD', 'EUR']

function PostJob() {
  const { t } = usePreferences()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Other',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    city: user?.city ?? '',
    street: '',
    price: '',
    currency: 'GEL',
    priceType: 'fixed',
    startDate: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [pin, setPin] = useState<LatLng | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // preview URLs for the chosen images (cleaned up when the list changes)
  const previews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images])
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

  function update(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function addImages(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES))
    e.target.value = '' // allow picking the same file again
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    // multipart form because we're sending files
    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => data.append(key, value))
    images.forEach((file) => data.append('images', file))
    if (pin) {
      data.append('lat', String(pin.lat))
      data.append('lng', String(pin.lng))
    }

    setSubmitting(true)
    try {
      // TODO (payments): charge the poster here before/while creating the job
      await api('/jobs', { method: 'POST', body: data })
      navigate('/my-jobs')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post job')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <p className="eyebrow">{t('FIND A HELPING HAND')}</p>
      <h1>{t('Post a job')}</h1>
      <p className="muted">{t('Tell people what you need, where, and what you’ll pay.')}</p>

      <form className="panel job-form" onSubmit={handleSubmit}>
        <h2>{t('Job details')}</h2>
        <div>
          <label>
            {t('Title')}
            <input name="title" value={form.title} onChange={update} maxLength={120} required />
          </label>
        </div>
        <div>
          <label>
            {t('Category')}{' '}
            <select name="category" value={form.category} onChange={update}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(c)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            {t('Description')}
            <br />
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              rows={6}
              cols={50}
              maxLength={5000}
              required
            />
          </label>
        </div>
        <div>
          <label>
            {t('Date needed (optional)')}{' '}
            <input type="date" name="startDate" value={form.startDate} onChange={update} />
          </label>
        </div>

        <h2>
          {t('Photos (up to')} {MAX_IMAGES})
        </h2>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={addImages}
        />
        <div>
          {previews.map((src, i) => (
            <div key={src} className="image-preview">
              <img src={src} alt="" width={120} />
              <br />
              <button type="button" onClick={() => removeImage(i)}>
                {t('Remove')}
              </button>
            </div>
          ))}
        </div>

        <h2>{t('Price')}</h2>
        <div>
          <label>
            {t('Price')}
            <input
              type="number"
              name="price"
              min={0}
              step="0.01"
              value={form.price}
              onChange={update}
              required
            />
          </label>{' '}
          <select name="currency" value={form.currency} onChange={update}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {t(c)}
              </option>
            ))}
          </select>{' '}
          <select name="priceType" value={form.priceType} onChange={update}>
            <option value="fixed">{t('Fixed price')}</option>
            <option value="hourly">{t('Per hour')}</option>
          </select>
        </div>

        <h2>{t('Contact')}</h2>
        <div>
          <label>
            {t('Phone')}
            <input type="tel" name="phone" value={form.phone} onChange={update} required />
          </label>
        </div>
        <div>
          <label>
            {t('Email')}
            <input type="email" name="email" value={form.email} onChange={update} required />
          </label>
        </div>

        <h2>{t('Location')}</h2>
        <div>
          <label>
            {t('City')}
            <input name="city" value={form.city} onChange={update} required />
          </label>
        </div>
        <div>
          <label>
            {t('Street')}
            <input name="street" value={form.street} onChange={update} required />
          </label>
        </div>
        <LocationPicker value={pin} onChange={setPin} />

        {error && (
          <p className="notice" role="alert">
            {t(error)}
          </p>
        )}

        <button className="primary" type="submit" disabled={submitting}>
          {t(submitting ? 'Posting...' : 'Post a job')}
        </button>
      </form>
    </div>
  )
}

export default PostJob
