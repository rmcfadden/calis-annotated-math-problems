import { describe, expect, it } from 'vitest'
import { imageExtFromFile, isAllowedImageType } from './image-file.ts'

describe('image-file', () => {
  it('maps mime types to extensions', () => {
    expect(imageExtFromFile({ type: 'image/png' })).toBe('png')
    expect(imageExtFromFile({ type: 'image/webp' })).toBe('webp')
    expect(imageExtFromFile({ type: 'image/svg+xml' })).toBe('svg')
    expect(imageExtFromFile({ type: 'image/jpeg' })).toBe('jpg')
  })

  it('allows empty or known types', () => {
    expect(isAllowedImageType('')).toBe(true)
    expect(isAllowedImageType('image/jpeg')).toBe(true)
    expect(isAllowedImageType('image/gif')).toBe(false)
  })
})
