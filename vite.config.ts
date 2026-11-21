/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { authorWritePlugin } from './vite-plugin-author.ts'
import { mdxPrePlugin } from './vite-mdx.ts'

export default defineConfig({
  base: '/calis-annotated-math-problems/',
  plugins: [mdxPrePlugin(), react(), tailwindcss(), authorWritePlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    environmentOptions: {
      jsdom: { url: 'http://localhost/calis-annotated-math-problems/' },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/**/*.{ts,tsx}',
        'author-write.ts',
        'vite-plugin-author.ts',
        'vite-mdx.ts',
        'scripts/ingest.mjs',
      ],
      exclude: [
        'src/main.tsx',
        'src/mdx.d.ts',
        'src/content/**',
        'src/assets/**',
        'src/test/**',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
