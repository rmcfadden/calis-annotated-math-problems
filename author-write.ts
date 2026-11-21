import fs from 'node:fs'
import path from 'node:path'
import { slugify } from './src/lib/slugify.ts'

const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'svg'])

export type AuthorPayload = {
  title?: string
  topic?: string
  imageBase64?: string
  imageExt?: string
  slug?: string
}

export type WriteResult = {
  status: number
  body: { id?: string; error?: string }
}

export function writeProblem(problemsDir: string, payload: AuthorPayload): WriteResult {
  const title = payload.title?.trim() || 'Untitled problem'
  const slug = slugify(payload.slug || title)
  const ext = (payload.imageExt || 'jpg').replace(/^\./, '').toLowerCase()

  if (!slug || !ALLOWED_EXT.has(ext) || !payload.imageBase64) {
    return { status: 400, body: { error: 'Need a title, image, and a jpg/png/webp/svg file.' } }
  }

  const dir = path.join(problemsDir, slug)
  if (fs.existsSync(dir)) {
    return { status: 409, body: { error: `A problem named "${slug}" already exists.` } }
  }

  const comma = payload.imageBase64.indexOf(',')
  const data = payload.imageBase64.slice(comma >= 0 ? comma + 1 : 0)
  const buffer = Buffer.from(data, 'base64')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `photo.${ext === 'jpeg' ? 'jpg' : ext}`), buffer)

  const topicLine = payload.topic ? `topic: ${payload.topic}\n` : ''
  fs.writeFileSync(
    path.join(dir, 'problem.mdx'),
    `---\ntitle: ${JSON.stringify(title)}\n${topicLine}---\n`,
  )

  return { status: 200, body: { id: slug } }
}
