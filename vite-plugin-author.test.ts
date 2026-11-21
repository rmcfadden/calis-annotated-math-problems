import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { describe, expect, it, vi } from 'vitest'
import {
  authorWritePlugin,
  errorMessage,
  handleAuthorWrite,
  isAuthorWriteRequest,
  problemsDir,
  readBody,
  sendJson,
} from './vite-plugin-author.ts'

function mockReq(method: string, url: string | undefined, body?: string, mode: 'buffer' | 'string' | 'error' = 'buffer') {
  const req = new EventEmitter() as IncomingMessage & EventEmitter
  req.method = method
  req.url = url
  queueMicrotask(() => {
    if (mode === 'error') {
      req.emit('error', new Error('stream failed'))
      return
    }
    if (body != null) {
      req.emit('data', mode === 'string' ? body : Buffer.from(body))
    }
    req.emit('end')
  })
  return req
}

describe('author plugin helpers', () => {
  it('stringifies errors', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom')
    expect(errorMessage('nope')).toBe('nope')
  })

  it('defaults the problems directory', () => {
    const previous = process.env.PROBLEMS_DIR
    delete process.env.PROBLEMS_DIR
    expect(problemsDir()).toMatch(/src\/content\/problems$/)
    process.env.PROBLEMS_DIR = previous
  })

  it('detects write requests including the Pages base path', () => {
    expect(isAuthorWriteRequest(mockReq('POST', '/calis-annotated-math-problems/__author/write?x=1'))).toBe(true)
    expect(isAuthorWriteRequest(mockReq('GET', '/__author/write'))).toBe(false)
    expect(isAuthorWriteRequest(mockReq('POST', undefined))).toBe(false)
  })

  it('reads buffer and string chunks', async () => {
    await expect(readBody(mockReq('POST', '/x', '{"a":1}'))).resolves.toBe('{"a":1}')
    await expect(readBody(mockReq('POST', '/x', '{"a":1}', 'string'))).resolves.toBe('{"a":1}')
    await expect(readBody(mockReq('POST', '/x', undefined, 'error'))).rejects.toThrow('stream failed')
  })

  it('writes json onto the response', () => {
    const res = {
      statusCode: 0,
      headers: {} as Record<string, string>,
      body: '',
      setHeader(name: string, value: string) {
        this.headers[name] = value
      },
      end(chunk?: string) {
        this.body = chunk ?? ''
      },
    }
    sendJson(res as unknown as ServerResponse, 200, { ok: true })
    expect(res.statusCode).toBe(200)
    expect(res.body).toBe('{"ok":true}')
  })

  it('writes a problem from a request body', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'author-'))
    const req = mockReq('POST', '/__author/write', JSON.stringify({ title: 'Hi', imageBase64: 'abc' }))
    const result = await handleAuthorWrite(req, dir)
    expect(result.status).toBe(200)
    fs.rmSync(dir, { recursive: true, force: true })
  })
})

describe('authorWritePlugin', () => {
  it('skips unrelated requests and reports JSON errors', async () => {
    const plugin = authorWritePlugin()
    let middleware: (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void> =
      async () => undefined
    plugin.configureServer?.({
      middlewares: {
        use(fn: typeof middleware) {
          middleware = fn
        },
      },
    } as never)

    const next = vi.fn()
    await middleware(mockReq('GET', '/other'), {} as ServerResponse, next)
    expect(next).toHaveBeenCalledOnce()

    const res = {
      statusCode: 0,
      headers: {} as Record<string, string>,
      body: '',
      setHeader(name: string, value: string) {
        this.headers[name] = value
      },
      end(chunk?: string) {
        this.body = chunk ?? ''
      },
    }
    await middleware(mockReq('POST', '/__author/write', 'not-json'), res as unknown as ServerResponse, next)
    expect(res.statusCode).toBe(500)
    expect(JSON.parse(res.body).error).toMatch(/JSON|Unexpected|not-json/)

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'author-mw-'))
    process.env.PROBLEMS_DIR = dir
    const ok = {
      statusCode: 0,
      headers: {} as Record<string, string>,
      body: '',
      setHeader(name: string, value: string) {
        this.headers[name] = value
      },
      end(chunk?: string) {
        this.body = chunk ?? ''
      },
    }
    await middleware(
      mockReq('POST', '/__author/write', JSON.stringify({ title: 'From Plugin', imageBase64: 'abc' })),
      ok as unknown as ServerResponse,
      next,
    )
    expect(ok.statusCode).toBe(200)
    expect(JSON.parse(ok.body).id).toBe('from-plugin')
    delete process.env.PROBLEMS_DIR
    fs.rmSync(dir, { recursive: true, force: true })
  })
})
