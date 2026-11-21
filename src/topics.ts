export const TOPICS = [
  { id: 'geometry', label: 'Geometry', slug: 'geometry' },
  { id: 'algebra', label: 'Algebra', slug: 'algebra' },
  { id: 'trigonometry', label: 'Trigonometry', slug: 'trigonometry' },
  { id: 'pre-calculus', label: 'Pre-Calculus', slug: 'pre-calculus' },
  { id: 'calculus', label: 'Calculus', slug: 'calculus' },
  { id: 'differential-equations', label: 'Differential Equations', slug: 'differential-equations' },
  { id: 'linear-algebra', label: 'Linear Algebra', slug: 'linear-algebra' },
  { id: 'analysis', label: 'Analysis', slug: 'analysis' },
  { id: 'discrete-math', label: 'Discrete Math', slug: 'discrete-math' },
  { id: 'abstract-algebra', label: 'Abstract Algebra', slug: 'abstract-algebra' },
  { id: 'complex-analysis', label: 'Complex Analysis', slug: 'complex-analysis' },
  { id: 'algorithms', label: 'Algorithms / Data Structures', slug: 'algorithms' },
] as const

export type TopicId = (typeof TOPICS)[number]['id']
export type Topic = (typeof TOPICS)[number]

export function parseTopic(raw?: string): TopicId | undefined {
  if (!raw) return undefined
  const value = raw.trim().toLowerCase()
  return TOPICS.find(
    (topic) => topic.id === value || topic.label.toLowerCase() === value,
  )?.id
}

export function topicBySlug(slug: string | undefined): Topic | undefined {
  if (!slug) return undefined
  return TOPICS.find((topic) => topic.slug === slug)
}

export function topicById(id: TopicId | undefined): Topic | undefined {
  if (!id) return undefined
  return TOPICS.find((topic) => topic.id === id)
}
