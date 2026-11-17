import 'dotenv/config'
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes'
import jobRoutes from './routes/jobRoutes'
import userRoutes from './routes/userRoutes'
import { UPLOAD_DIR } from './upload'

const PORT = Number(process.env.PORT) || 5000
const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI || !process.env.JWT_SECRET) {
  throw new Error('Set MONGODB_URI and JWT_SECRET in server/.env')
}

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// logs every API request: method, url, status code and how long it took
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`[http] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

// quick check: open http://localhost:5173/api/health in the browser
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'NOT connected' })
})

app.use('/uploads', express.static(UPLOAD_DIR)) // uploaded job photos
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)

// last-resort error handler (Express 5 forwards async errors here automatically)
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server error]', err)
  const status =
    err.name === 'MulterError' || err.name === 'ValidationError' || err.name === 'CastError'
      ? 400
      : err.status || 500
  res.status(status).json({ error: status === 500 ? 'Server error - see the server terminal for details' : err.message })
})

console.log('Connecting to MongoDB...')
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err)
    process.exit(1)
  })