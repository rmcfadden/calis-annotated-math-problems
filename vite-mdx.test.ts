import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileMdxSource, mdxPrePlugin } from './vite-mdx.ts'

const sample = path.resolve('src/content/problems/completing-the-square/problem.mdx')

describe('mdxPrePlugin', () => {
  it('compiles MDX to JavaScript', async () => {
    const result = await compileMdxSource(
      `---\ntitle: Demo\n---\n\nHello $x$\n\n<Hint>Tip</Hint>\n`,
      '/virtual/problem.mdx',
      true,
    )
    expect(result.moduleType).toBe('js')
    expect(result.code).toContain('Hello')
    expect(result.code).not.toContain('<Hint>Tip</Hint>')
  })

  it('loads and transforms problem files', async () => {
    const plugin = mdxPrePlugin()
    const config = plugin.config
    if (typeof config === 'function') {
      config({}, { mode: 'development', command: 'serve' })
      config({}, { mode: 'production', command: 'build' })
    }
    const load = plugin.load
    const transform = plugin.transform
    expect(typeof load === 'object' && load.filter).toBeTruthy()
    expect(typeof transform === 'object' && transform.filter).toBeTruthy()

    const loaded = typeof load === 'object' ? await load.handler.call({}, sample) : undefined
    expect(loaded && typeof loaded === 'object' && 'code' in loaded ? loaded.code : '').toContain('jsx')

    const skippedRaw = typeof load === 'object' ? await load.handler.call({}, `${sample}?raw`) : 'x'
    expect(skippedRaw).toBeUndefined()

    const skippedOther = typeof load === 'object' ? await load.handler.call({}, '/tmp/file.ts') : 'x'
    expect(skippedOther).toBeUndefined()

    if (typeof transform === 'object') {
      const alreadyJs = await transform.handler.call({}, 'import {jsx as _jsx} from "react/jsx-runtime"', sample)
      expect(alreadyJs).toBeUndefined()
      const compiled = await transform.handler.call({}, '<Hint>Tip</Hint>', sample)
      expect(compiled && typeof compiled === 'object' && 'code' in compiled ? compiled.code : '').not.toContain(
        '<Hint>Tip</Hint>',
      )
    }
  })
})
