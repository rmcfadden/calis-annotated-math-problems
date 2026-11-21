import { describe, expect, it } from 'vitest'
import { answersMatch } from './answers.ts'

describe('answersMatch', () => {
  it('rejects empty input', () => {
    expect(answersMatch('3', '')).toBe(false)
    expect(answersMatch('3', '   ')).toBe(false)
  })

  it('accepts exact strings', () => {
    expect(answersMatch('3', '3')).toBe(true)
  })

  it('accepts equivalent expressions', () => {
    expect(answersMatch('1/2', '0.5')).toBe(true)
    expect(answersMatch('3', '1+2')).toBe(true)
  })

  it('rejects different values', () => {
    expect(answersMatch('3', '2')).toBe(false)
  })

  it('falls back to case-insensitive text', () => {
    expect(answersMatch('Yes', 'yes')).toBe(true)
    expect(answersMatch('yes', 'nope')).toBe(false)
  })

  it('accepts floating-point noise', () => {
    expect(answersMatch('0.3', '0.1+0.2')).toBe(true)
  })
})
