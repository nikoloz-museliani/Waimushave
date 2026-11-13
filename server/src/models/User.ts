import { Schema, model } from 'mongoose'
import type { HydratedDocument } from 'mongoose'

export interface IUser {
  name: string
  email: string
  passwordHash: string
  phone?: string
  city?: string
  bio?: string
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true, maxlength: 40 },
    city: { type: String, trim: true, maxlength: 80 },
    bio: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
)

export const User = model<IUser>('User', userSchema)

// What we send to the browser (never the password hash)
export function toPublicUser(u: HydratedDocument<IUser>) {
  return { _id: u.id as string, name: u.name, email: u.email, phone: u.phone, city: u.city, bio: u.bio }
}
