import { Router } from 'express'
import type { Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, toPublicUser } from '../models/User'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
}

// sends { error, field } so the frontend can show the message under the right input
function fail(res: Response, status: number, error: string, field?: string) {
  console.log(`[auth] X ${status} ${error}`)
  res.status(status).json({ error, field })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {}
  console.log('[auth] register attempt for:', typeof email === 'string' ? email : '(no email sent)')

  if (typeof name !== 'string' || !name.trim()) return fail(res, 400, 'Please enter your name', 'name')
  if (name.trim().length > 80) return fail(res, 400, 'Name is too long (80 characters max)', 'name')
  if (typeof email !== 'string' || !email.trim()) return fail(res, 400, 'Please enter your email', 'email')
  if (!EMAIL_RE.test(email.trim())) return fail(res, 400, 'This email address does not look valid', 'email')
  if (typeof password !== 'string' || password.length < 6) {
    return fail(res, 400, 'Password must be at least 6 characters', 'password')
  }
  if (password.length > 72) return fail(res, 400, 'Password is too long (72 characters max)', 'password')

  const cleanEmail = email.toLowerCase().trim()

  console.log('[auth] checking if email is already used...')
  if (await User.findOne({ email: cleanEmail })) {
    return fail(res, 409, 'An account with this email already exists. Try logging in.', 'email')
  }

  try {
    console.log('[auth] hashing password and saving user...')
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: await bcrypt.hash(password, 10),
    })
    console.log('[auth] OK user created, id:', user.id)
    res.status(201).json({ token: signToken(user.id), user: toPublicUser(user) })
  } catch (err) {
    // 11000 = MongoDB "duplicate key" (two sign-ups with the same email at the same moment)
    if ((err as { code?: number }).code === 11000) {
      return fail(res, 409, 'An account with this email already exists. Try logging in.', 'email')
    }
    throw err // handled (and logged) by the error handler in index.ts
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  console.log('[auth] login attempt for:', typeof email === 'string' ? email : '(no email sent)')

  if (typeof email !== 'string' || !email.trim()) return fail(res, 400, 'Please enter your email', 'email')
  if (typeof password !== 'string' || !password) return fail(res, 400, 'Please enter your password', 'password')

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) return fail(res, 401, 'No account found with this email', 'email')

  const passwordOk = await bcrypt.compare(password, user.passwordHash)
  if (!passwordOk) return fail(res, 401, 'Wrong password', 'password')

  console.log('[auth] OK login success for user id:', user.id)
  res.json({ token: signToken(user.id), user: toPublicUser(user) })
})

// GET /api/auth/me  (used on page load to restore the session)
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId)
  if (!user) return fail(res, 401, 'Account no longer exists')
  console.log('[auth] session check OK for', user.email)
  res.json({ user: toPublicUser(user) })
})

export default router