import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { Plugin } from 'vite'
import { writeProblem, type AuthorPayload } from './author-write.ts'

export function problemsDir(): string {
  return path.resolve(process.env.PROBLEMS_DIR || 'src/content/problems')
}

export function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export function isAuthorWriteRequest(req: IncomingMessage): boolean {
  const url = req.url?.split('?')[0] ?? ''
  return url.endsWith('/__author/write') && req.method === 'POST'
}

export async function handleAuthorWrite(
  req: IncomingMessage,
  dir = problemsDir(),
): Promise<{ status: number; body: unknown }> {
  const payload = JSON.parse(await readBody(req)) as AuthorPayload
  return writeProblem(dir, payload)
}

export function authorWritePlugin(): Plugin {
  return {
    name: 'author-write',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!isAuthorWriteRequest(req)) {
          next()
          return
        }

        try {
          const result = await handleAuthorWrite(req)
          sendJson(res, result.status, result.body)
        } catch (error) {
          sendJson(res, 500, { error: errorMessage(error) })
        }
      })
    },
  }
}
