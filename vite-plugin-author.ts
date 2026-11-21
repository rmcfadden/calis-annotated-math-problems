import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { Plugin } from 'vite'

const PROBLEMS_DIR = path.resolve('src/content/problems')

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export function authorWritePlugin(): Plugin {
  return {
    name: 'author-write',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (!url.endsWith('/__author/write') || req.method !== 'POST') {
          next()
          return
        }

        try {
          const payload = JSON.parse(await readBody(req)) as {
            title?: string
            topic?: string
            imageBase64?: string
            imageExt?: string
            slug?: string
          }

          const title = payload.title?.trim() || 'Untitled problem'
          const slug = slugify(payload.slug || title)
          const ext = (payload.imageExt || 'jpg').replace(/^\./, '').toLowerCase()
          const allowed = new Set(['jpg', 'jpeg', 'png', 'webp', 'svg'])
          if (!slug || !allowed.has(ext) || !payload.imageBase64) {
            sendJson(res, 400, { error: 'Need a title, image, and a jpg/png/webp/svg file.' })
            return
          }

          const dir = path.join(PROBLEMS_DIR, slug)
          if (fs.existsSync(dir)) {
            sendJson(res, 409, { error: `A problem named "${slug}" already exists.` })
            return
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

          sendJson(res, 200, { id: slug })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Write failed'
          sendJson(res, 500, { error: message })
        }
      })
    },
  }
}
