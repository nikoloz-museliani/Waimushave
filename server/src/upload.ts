import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

export const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// extension comes from the verified mime type, not from the user's filename
const EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, crypto.randomUUID() + EXT[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 5 MB each, 6 max
  fileFilter: (_req, file, cb) => {
    if (EXT[file.mimetype]) cb(null, true)
    else cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'))
  },
})
