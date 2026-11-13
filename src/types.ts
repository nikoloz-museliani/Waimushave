export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  city?: string
  bio?: string
}

export interface UserRef {
  _id: string
  name: string
}

export interface LatLng {
  lat: number
  lng: number
}

export type JobStatus = 'open' | 'in_progress' | 'done'

export interface Job {
  _id: string
  title: string
  description: string
  images: string[]
  // phone + email are only sent by the server to logged-in users
  phone?: string
  email?: string
  city: string
  street: string
  location?: LatLng
  price: number
  currency: string
  priceType: 'fixed' | 'hourly'
  category: string
  startDate?: string
  status: JobStatus
  postedBy: UserRef
  acceptedBy?: UserRef | null
  createdAt: string
}
