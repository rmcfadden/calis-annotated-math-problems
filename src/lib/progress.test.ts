import { beforeEach, describe, expect, it } from 'vitest'
import { isSolved, markSolved } from './progress.ts'

describe('progress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts unsolved', () => {
    expect(isSolved('a')).toBe(false)
  })

  it('marks a problem solved', () => {
    markSolved('a')
    expect(isSolved('a')).toBe(true)
  })

  it('ignores invalid stored JSON', () => {
    localStorage.setItem('solved-problems', '{')
    expect(isSolved('a')).toBe(false)
  })

  it('ignores a non-array payload', () => {
    localStorage.setItem('solved-problems', '{"id":"a"}')
    expect(isSolved('a')).toBe(false)
  })

  it('keeps only string ids', () => {
    localStorage.setItem('solved-problems', JSON.stringify(['a', 1, null]))
    expect(isSolved('a')).toBe(true)
    expect(isSolved('1')).toBe(false)
  })
})
