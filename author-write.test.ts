import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { writeProblem } from './author-write.ts'

const dirs: string[] = []

function tmp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'problems-'))
  dirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('writeProblem', () => {
  it('writes a photo and stub mdx', () => {
    const dir = tmp()
    const result = writeProblem(dir, {
      title: 'Chain Rule',
      topic: 'calculus',
      imageBase64: `data:image/png;base64,${Buffer.from('img').toString('base64')}`,
      imageExt: '.png',
    })
    expect(result.status).toBe(200)
    expect(result.body.id).toBe('chain-rule')
    expect(fs.existsSync(path.join(dir, 'chain-rule', 'photo.png'))).toBe(true)
    expect(fs.readFileSync(path.join(dir, 'chain-rule', 'problem.mdx'), 'utf8')).toContain('topic: calculus')
  })

  it('defaults the title and jpeg extension', () => {
    const dir = tmp()
    const result = writeProblem(dir, {
      imageBase64: Buffer.from('img').toString('base64'),
      imageExt: 'jpeg',
    })
    expect(result.body.id).toBe('untitled-problem')
    expect(fs.existsSync(path.join(dir, 'untitled-problem', 'photo.jpg'))).toBe(true)
  })

  it('rejects a missing image or empty slug', () => {
    expect(writeProblem(tmp(), { title: 'Hi' }).status).toBe(400)
    expect(writeProblem(tmp(), { slug: '!!!', imageBase64: 'abc' }).status).toBe(400)
    expect(writeProblem(tmp(), { title: 'Hi', imageBase64: 'abc', imageExt: 'gif' }).status).toBe(400)
  })

  it('rejects an existing folder', () => {
    const dir = tmp()
    writeProblem(dir, { title: 'Hi', imageBase64: 'abc' })
    expect(writeProblem(dir, { title: 'Hi', imageBase64: 'abc' }).status).toBe(409)
  })
})
