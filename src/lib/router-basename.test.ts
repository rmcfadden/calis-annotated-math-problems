import { describe, expect, it } from 'vitest'
import { routerBasename } from './router-basename.ts'

describe('routerBasename', () => {
  it('strips a trailing slash', () => {
    expect(routerBasename('/repo/')).toBe('/repo')
  })

  it('keeps root', () => {
    expect(routerBasename('/')).toBe('/')
    expect(routerBasename('')).toBe('/')
  })
})
