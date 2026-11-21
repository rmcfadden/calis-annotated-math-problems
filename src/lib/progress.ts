const KEY = 'solved-problems'

function readSolved(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? new Set(parsed.filter((id) => typeof id === 'string')) : new Set()
  } catch {
    return new Set()
  }
}

export function isSolved(id: string): boolean {
  return readSolved().has(id)
}

export function markSolved(id: string): void {
  const next = readSolved()
  next.add(id)
  localStorage.setItem(KEY, JSON.stringify([...next]))
}
