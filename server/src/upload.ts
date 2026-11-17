import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import sharp from 'sharp'
import { InputError } from './validation'

export const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 6, fields: 20, fieldSize: 20 * 1024, parts: 26 },
})

// Decode the actual bytes and re-encode to remove metadata and embedded payloads.
export async function normalizeImage(buffer: Buffer) {
  try {
    const decoder = sharp(buffer, { limitInputPixels: 20_000_000, failOn: 'warning' })
    const metadata = await decoder.metadata()
    if (!['jpeg', 'png', 'webp', 'gif'].includes(metadata.format ?? ''))
      throw new Error('Unsupported image')
    return await decoder.rotate().webp({ quality: 85 }).toBuffer()
  } catch {
    throw new InputError('Upload a valid JPG, PNG, WEBP or GIF image (maximum 20 megapixels).')
  }
}

export async function saveImages(files: Express.Multer.File[]) {
  const urls: string[] = []
  try {
    for (const file of files) {
      const bytes = await normalizeImage(file.buffer)
      const name = `${crypto.randomUUID()}.webp`
      urls.push(`/uploads/${name}`)
      await fs.promises.writeFile(path.join(UPLOAD_DIR, name), bytes, { flag: 'wx' })
    }
    return urls
  } catch (error) {
    await Promise.all(
      urls.map((url) =>
        fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(url))).catch(() => {}),
      ),
    )
    throw error
  }
}
