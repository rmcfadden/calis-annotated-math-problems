import { compile } from '@mdx-js/mdx'
import fs from 'node:fs'
import rehypeKatex from 'rehype-katex'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMath from 'remark-math'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import type { Plugin } from 'vite'

const mdxId = /\.mdx(?:$|\?)/

export async function compileMdxSource(source: string, filepath: string, development: boolean) {
  const compiled = await compile(
    { path: filepath, value: source },
    {
      development,
      jsxImportSource: 'react',
      remarkPlugins: [remarkMath, remarkFrontmatter, remarkMdxFrontmatter],
      rehypePlugins: [rehypeKatex],
    },
  )
  return {
    code: String(compiled),
    moduleType: 'js' as const,
  }
}

function mdxPath(id: string): string | undefined {
  if (id.includes('?raw')) return undefined
  const file = id.split('?')[0]
  return file.endsWith('.mdx') ? file : undefined
}

export function mdxPrePlugin(): Plugin {
  let development = false

  const compileId = async (id: string, source?: string) => {
    const file = mdxPath(id)
    if (!file) return undefined
    const code = source ?? fs.readFileSync(file, 'utf8')
    return compileMdxSource(code, file, development)
  }

  return {
    name: 'mdx-pre',
    enforce: 'pre',
    config(_config, env) {
      development = env.mode !== 'production'
    },
    load: {
      filter: { id: { include: [mdxId, '**/*.mdx'] } },
      async handler(id) {
        return compileId(id)
      },
    },
    transform: {
      filter: { id: { include: [mdxId, '**/*.mdx'] } },
      async handler(code, id) {
        if (code.startsWith('import ') || code.startsWith('/*@jsx')) return undefined
        return compileId(id, code)
      },
    },
  }
}
