import { createContext, useContext } from 'react'
import type { Problem } from './problems.ts'

const ProblemContext = createContext<Problem | null>(null)

export const ProblemProvider = ProblemContext.Provider

export function useProblem(): Problem {
  const problem = useContext(ProblemContext)
  if (!problem) {
    throw new Error('Interactive widgets must be rendered on a problem page.')
  }
  return problem
}
