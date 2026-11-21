import { describe, expect, it } from 'vitest'
import { parseTopic, topicById, topicBySlug, TOPICS } from './topics.ts'

describe('topics', () => {
  it('lists twelve curriculum topics', () => {
    expect(TOPICS).toHaveLength(12)
  })

  it('parses ids and labels', () => {
    expect(parseTopic('Algebra')).toBe('algebra')
    expect(parseTopic('  CALCULUS  ')).toBe('calculus')
    expect(parseTopic()).toBeUndefined()
    expect(parseTopic('not-a-topic')).toBeUndefined()
  })

  it('looks up by slug and id', () => {
    expect(topicBySlug('pre-calculus')?.label).toBe('Pre-Calculus')
    expect(topicBySlug(undefined)).toBeUndefined()
    expect(topicById('geometry')?.slug).toBe('geometry')
    expect(topicById(undefined)).toBeUndefined()
  })
})
