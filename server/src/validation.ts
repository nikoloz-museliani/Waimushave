export const CATEGORIES = ['Cleaning', 'Repairs', 'Moving', 'Delivery', 'Gardening', 'Painting', 'Tutoring', 'Other']
export class InputError extends Error { status = 400 }

export function parseJob(input: Record<string, unknown>) {
  const text = (key: string, max: number, required = true) => {
    const value = input[key]
    if (value === undefined && !required) return ''
    if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
      throw new InputError(`Invalid ${key}`)
    }
    return value.trim()
  }
  const title = text('title', 120)
  const description = text('description', 5000)
  const phone = text('phone', 40)
  if (!/^\+?[\d\s()-]{6,40}$/.test(phone) || phone.replace(/\D/g, '').length < 6) throw new InputError('Invalid phone')
  const email = text('email', 254).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InputError('Invalid email')
  const city = text('city', 80)
  const street = text('street', 200)
  const price = Number(text('price', 30))
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000_000) throw new InputError('Invalid price')
  const category = text('category', 40, false) || 'Other'
  if (!CATEGORIES.includes(category)) throw new InputError('Invalid category')
  const currency = text('currency', 3, false) || 'GEL'
  if (currency !== 'GEL' && currency !== 'USD' && currency !== 'EUR') throw new InputError('Invalid currency')
  const priceType = text('priceType', 10, false) || 'fixed'
  if (priceType !== 'fixed' && priceType !== 'hourly') throw new InputError('Invalid price type')
  const latText = text('lat', 30, false), lngText = text('lng', 30, false)
  let location: { lat: number; lng: number } | undefined
  if (latText || lngText) {
    const lat = Number(latText), lng = Number(lngText)
    if (!latText || !lngText || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new InputError('Invalid map coordinates')
    location = { lat, lng }
  }
  const date = text('startDate', 10, false)
  let startDate: Date | undefined
  if (date) {
    startDate = new Date(date)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(startDate.getTime()) || startDate.toISOString().slice(0, 10) !== date) throw new InputError('Invalid start date')
  }
  return { title, description, phone, email, city, street, price, category, currency, priceType, location, startDate } as const
}
