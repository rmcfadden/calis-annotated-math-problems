import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import rehypeKatex from 'rehype-katex'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMath from 'remark-math'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig } from 'vite'
import { authorWritePlugin } from './vite-plugin-author.ts'

export default defineConfig({
  base: '/calis-annotated-math-problems/',
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkMath, remarkFrontmatter, remarkMdxFrontmatter],
        rehypePlugins: [rehypeKatex],
      }),
    },
    react(),
    tailwindcss(),
    authorWritePlugin(),
  ],
})
