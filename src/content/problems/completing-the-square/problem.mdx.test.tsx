import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { mdxComponents } from '../../../components/widgets/mdx-components.ts'
import { ProblemProvider } from '../../../lib/problem-context.ts'
import type { Problem } from '../../../lib/problems.ts'
import ProblemMdx, { frontmatter } from './problem.mdx'

const problem: Problem = {
  id: 'completing-the-square',
  title: String(frontmatter.title),
  topic: 'algebra',
  answer: String(frontmatter.answer),
  photoUrl: '/photo.svg',
}

describe('completing-the-square MDX', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('compiles JSX widgets instead of leaving raw MDX', () => {
    expect(frontmatter.title).toBe('Completing the square')
    render(
      <ProblemProvider value={problem}>
        <ProblemMdx components={mdxComponents} />
      </ProblemProvider>,
    )
    expect(screen.getByRole('button', { name: /hint/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Your answer')).toBeInTheDocument()
  })

  it('checks the sample answer', async () => {
    const user = userEvent.setup()
    render(
      <ProblemProvider value={problem}>
        <ProblemMdx components={mdxComponents} />
      </ProblemProvider>,
    )
    await user.type(screen.getByLabelText('Your answer'), '3')
    await user.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByText(/marked solved/i)).toBeInTheDocument()
  })
})
