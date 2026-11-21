import mdx from '@mdx-js/rollup'
import rehypeKatex from 'rehype-katex'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMath from 'remark-math'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import type { Plugin, TransformResult } from 'vite'

export function mdxPrePlugin(): Plugin {
  const plugin = mdx({
    remarkPlugins: [remarkMath, remarkFrontmatter, remarkMdxFrontmatter],
    rehypePlugins: [rehypeKatex],
    jsxImportSource: 'react',
  })
  const transform = plugin.transform as (this: unknown, code: string, id: string) => unknown

  return {
    name: plugin.name,
    enforce: 'pre',
    config: plugin.config,
    transform: {
      filter: { id: /\.mdx(?:$|\?)/ },
      async handler(code, id) {
        return (await transform.call(this, code, id)) as TransformResult
      },
    },
  }
}
