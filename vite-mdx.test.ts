import { describe, expect, it } from 'vitest'
import { mdxPrePlugin } from './vite-mdx.ts'

describe('mdxPrePlugin', () => {
  it('compiles MDX with JSX widgets', async () => {
    const plugin = mdxPrePlugin()
    const config = plugin.config
    if (typeof config === 'function') {
      config({}, { mode: 'test', command: 'serve' })
    }
    const transform = plugin.transform
    expect(transform).toBeTruthy()
    expect(typeof transform === 'object' && transform.filter).toBeTruthy()
    const handler = typeof transform === 'function' ? transform : transform.handler
    const result = await handler.call(
      {},
      `---\ntitle: Demo\n---\n\nHello $x$\n\n<Hint>Tip</Hint>\n`,
      '/virtual/problem.mdx',
    )
    expect(result).toBeTruthy()
    const code = typeof result === 'object' && result && 'code' in result ? result.code : String(result)
    expect(code).toContain('Hello')
    expect(code).not.toContain('<Hint>Tip</Hint>')
  })
})
