import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

function readUserId(req: Request): string | null {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET as string) as { userId: string }
    return payload.userId
  } catch {
    return null
  }
}

// Route needs a logged-in user
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = readUserId(req)
  if (!userId) {
    res.status(401).json({ error: 'Please log in' })
    return
  }
  req.userId = userId
  next()
}

// Route works for everyone, but we learn who the user is if they are logged in
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const userId = readUserId(req)
  if (userId) req.userId = userId
  next()
}
