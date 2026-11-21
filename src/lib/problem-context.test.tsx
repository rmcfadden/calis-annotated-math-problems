import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useProblem } from './problem-context.ts'

function Probe() {
  useProblem()
  return null
}

describe('useProblem', () => {
  it('throws outside a problem page', () => {
    expect(() => render(<Probe />)).toThrow('Interactive widgets must be rendered on a problem page.')
  })
})
