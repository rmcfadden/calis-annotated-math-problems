import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { ingest, isEntryPoint, maybeRunCli, parseArgs, runCli, slugify } from './ingest.mjs'

const dirs: string[] = []

function tmp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ingest-'))
  dirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('ingest', () => {
  it('parses flags', () => {
    expect(parseArgs(['img.jpg', '--topic', 'algebra', '--title'])).toEqual({
      positional: ['img.jpg'],
      flags: { topic: 'algebra', title: true },
    })
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('requires an image path', () => {
    expect(ingest([]).status).toBe(1)
  })

  it('rejects a missing file', () => {
    expect(ingest(['/nope/missing.jpg']).error).toMatch(/No file at/)
  })

  it('rejects a non-image', () => {
    const dir = tmp()
    const file = path.join(dir, 'notes.txt')
    fs.writeFileSync(file, 'x')
    expect(ingest([file], { problemsDir: dir }).error).toMatch(/jpg/)
  })

  it('copies jpeg photos and writes mdx', () => {
    const dir = tmp()
    const file = path.join(dir, 'My_Photo.jpeg')
    fs.writeFileSync(file, 'img')
    const problems = path.join(dir, 'out')
    const result = ingest([file, '--topic', 'geometry'], { problemsDir: problems })
    expect(result.status).toBe(0)
    expect(fs.existsSync(path.join(problems, 'my-photo', 'photo.jpg'))).toBe(true)
    expect(fs.readFileSync(path.join(problems, 'my-photo', 'problem.mdx'), 'utf8')).toContain(
      'topic: geometry',
    )
  })

  it('uses an explicit title and slug', () => {
    const dir = tmp()
    const file = path.join(dir, 'a.png')
    fs.writeFileSync(file, 'img')
    const problems = path.join(dir, 'out')
    const result = ingest([file, '--title', 'Chain Rule', '--slug', 'chain-rule'], {
      problemsDir: problems,
    })
    expect(result.status).toBe(0)
    expect(result.dir).toBe(path.join(problems, 'chain-rule'))
  })

  it('refuses to overwrite', () => {
    const dir = tmp()
    const file = path.join(dir, 'a.png')
    fs.writeFileSync(file, 'img')
    const problems = path.join(dir, 'out')
    ingest([file, '--slug', 'a'], { problemsDir: problems })
    expect(ingest([file, '--slug', 'a'], { problemsDir: problems }).status).toBe(1)
  })

  it('detects CLI entry', () => {
    expect(isEntryPoint(import.meta.url, undefined)).toBe(false)
    const self = fileURLToPath(import.meta.url)
    expect(isEntryPoint(pathToFileURL(self).href, self)).toBe(true)
  })

  it('prints success and errors', () => {
    const dir = tmp()
    const file = path.join(dir, 'a.png')
    fs.writeFileSync(file, 'img')
    const logs: string[] = []
    const errors: string[] = []
    const io = { log: (msg: string) => logs.push(msg), error: (msg: string) => errors.push(msg) }
    process.env.PROBLEMS_DIR = path.join(dir, 'out')
    expect(runCli([file], io)).toBe(0)
    expect(logs[0]).toMatch(/^Wrote /)
    expect(runCli([], io)).toBe(1)
    expect(errors[0]).toMatch(/Usage/)
    delete process.env.PROBLEMS_DIR
  })

  it('exits when run as the CLI entry', () => {
    const self = fileURLToPath(import.meta.url)
    const codes: number[] = []
    maybeRunCli(pathToFileURL(self).href, self, (code) => {
      codes.push(Number(code))
    })
    maybeRunCli(import.meta.url, undefined)
    expect(codes[0]).toBe(1)
  })
})
