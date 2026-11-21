import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ProblemProvider } from '../../lib/problem-context.ts'
import type { Problem } from '../../lib/problems.ts'
import { mdxComponents } from './mdx-components.ts'
import { AnswerCheck } from './AnswerCheck.tsx'
import { Hint } from './Hint.tsx'
import { Solution } from './Solution.tsx'

const problem: Problem = {
  id: 'p1',
  title: 'Sample',
  answer: '4',
  photoUrl: '/p.svg',
}

describe('widgets', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exports Hint, Solution, and AnswerCheck', () => {
    expect(mdxComponents.Hint).toBe(Hint)
    expect(mdxComponents.Solution).toBe(Solution)
    expect(mdxComponents.AnswerCheck).toBe(AnswerCheck)
  })

  it('toggles hint and solution', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Hint>Try a square.</Hint>
        <Solution>x = 3</Solution>
      </>,
    )
    expect(screen.queryByText('Try a square.')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /hint/i }))
    expect(screen.getByText('Try a square.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /hint/i }))
    expect(screen.queryByText('Try a square.')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /solution/i }))
    expect(screen.getByText('x = 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /solution/i }))
  })

  it('renders empty hint and solution panels', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Hint />
        <Solution />
      </>,
    )
    await user.click(screen.getByRole('button', { name: /hint/i }))
    await user.click(screen.getByRole('button', { name: /solution/i }))
    expect(screen.getByRole('button', { name: /hint/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('hides the checker when there is no answer', () => {
    const { container } = render(
      <ProblemProvider value={{ ...problem, answer: undefined }}>
        <AnswerCheck />
      </ProblemProvider>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows try again then success', async () => {
    const user = userEvent.setup()
    render(
      <ProblemProvider value={problem}>
        <AnswerCheck />
      </ProblemProvider>,
    )
    await user.type(screen.getByLabelText('Your answer'), '1')
    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByText('Try again.')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Your answer'))
    await user.type(screen.getByLabelText('Your answer'), '4')
    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByText(/marked solved/i)).toBeInTheDocument()
  })

  it('restores a solved problem', () => {
    localStorage.setItem('solved-problems', JSON.stringify(['p1']))
    render(
      <ProblemProvider value={problem}>
        <AnswerCheck />
      </ProblemProvider>,
    )
    expect(screen.getByText(/marked solved/i)).toBeInTheDocument()
  })
})
