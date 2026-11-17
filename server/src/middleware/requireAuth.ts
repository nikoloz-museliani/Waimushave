import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'

// Add one optional property to Express’s Request type. Middleware fills it only
// after verification; handlers must not accept a userId from the request body.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Express request augmentation
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

// A JWT is signed, not encrypted. It contains an id, never a password. verify()
// checks the signature and expiry; decode() alone would be unsafe here.
function readUserId(req: Request): string | null {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  try {
    // JWT_SECRET stays on the server. Publishing it would let anyone forge tokens.
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET as string) as {
      userId: string
    }
    return typeof payload.userId === 'string' && /^[a-f0-9]{24}$/i.test(payload.userId)
      ? payload.userId
      : null
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
  // next() hands control to the following middleware or route handler.
  next()
}

// Route works for everyone, but we learn who the user is if they are logged in
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const userId = readUserId(req)
  if (userId) req.userId = userId
  // next() hands control to the following middleware or route handler.
  next()
}
