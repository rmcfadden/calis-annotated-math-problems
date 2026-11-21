declare module '*.mdx' {
  import type { ComponentType } from 'react'

  export const frontmatter: {
    id?: string
    title?: string
    topic?: string
    difficulty?: number
    answer?: string
  }

  const MDXComponent: ComponentType<{
    components?: Record<string, ComponentType>
  }>
  export default MDXComponent
}
