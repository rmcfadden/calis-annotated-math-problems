import { describe, expect, it } from 'vitest'
import { slugify } from './slugify.ts'

describe('slugify', () => {
  it('builds a url slug', () => {
    expect(slugify(' Completing the Square ')).toBe('completing-the-square')
  })

  it('strips punctuation', () => {
    expect(slugify('!!!')).toBe('')
    expect(slugify('--Hello--World--')).toBe('hello-world')
  })
})
