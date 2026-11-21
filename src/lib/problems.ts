import type { ComponentType } from 'react'
import { parseTopic, type TopicId } from '../topics.ts'

export type ProblemFrontmatter = {
  id?: string
  title?: string
  topic?: string
  difficulty?: number
  answer?: string
}

export type MdxProblem = ComponentType<{
  components?: Record<string, ComponentType>
}>

export type Problem = {
  id: string
  title: string
  topic?: TopicId
  difficulty?: number
  answer?: string
  photoUrl: string
  Mdx?: MdxProblem
}

const photoModules = import.meta.glob<string>(
  '../content/problems/*/photo.{jpg,jpeg,png,webp,svg}',
  { eager: true, query: '?url', import: 'default' },
)

const mdxModules = import.meta.glob<{
  default: MdxProblem
  frontmatter?: ProblemFrontmatter
}>('../content/problems/*/problem.mdx', { eager: true })

export function folderIdFromPath(filePath: string): string {
  const match = filePath.match(/problems\/([^/]+)\//)
  if (!match) throw new Error(`Could not read problem id from ${filePath}`)
  return match[1]
}

export function titleFromId(id: string): string {
  return id
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function mdxById(): Map<string, { default: MdxProblem; frontmatter?: ProblemFrontmatter }> {
  const map = new Map<string, { default: MdxProblem; frontmatter?: ProblemFrontmatter }>()
  for (const [filePath, mod] of Object.entries(mdxModules)) {
    map.set(folderIdFromPath(filePath), mod)
  }
  return map
}

export function loadProblems(): Problem[] {
  const mdx = mdxById()
  const problems: Problem[] = Object.entries(photoModules).map(([filePath, photoUrl]) => {
    const id = folderIdFromPath(filePath)
    const extra = mdx.get(id)
    const frontmatter = extra?.frontmatter
    return {
      id: frontmatter?.id ?? id,
      title: frontmatter?.title ?? titleFromId(id),
      topic: parseTopic(frontmatter?.topic),
      difficulty: frontmatter?.difficulty,
      answer: frontmatter?.answer != null ? String(frontmatter.answer) : undefined,
      photoUrl,
      Mdx: extra?.default,
    }
  })

  return problems.sort((a, b) => a.title.localeCompare(b.title))
}

export function getProblem(id: string): Problem | undefined {
  return loadProblems().find((problem) => problem.id === id)
}
