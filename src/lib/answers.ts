import { equal, evaluate, number as toNumber } from 'mathjs'

export function answersMatch(expected: string, given: string): boolean {
  const left = given.trim()
  const right = expected.trim()
  if (!left) return false
  if (left === right) return true

  try {
    const a = evaluate(left)
    const b = evaluate(right)
    if (equal(a, b)) return true
    return Math.abs(Number(toNumber(a)) - Number(toNumber(b))) < 1e-6
  } catch {
    return left.toLowerCase() === right.toLowerCase()
  }
}
