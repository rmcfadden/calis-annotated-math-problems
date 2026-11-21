import { describe, expect, it } from 'vitest'
import { folderIdFromPath, getProblem, loadProblems, titleFromId } from './problems.ts'

describe('problems', () => {
  it('reads a folder id from a glob path', () => {
    expect(folderIdFromPath('../content/problems/completing-the-square/photo.svg')).toBe(
      'completing-the-square',
    )
  })

  it('rejects a path without a problem folder', () => {
    expect(() => folderIdFromPath('photo.svg')).toThrow('Could not read problem id')
  })

  it('titles a slug', () => {
    expect(titleFromId('completing-the-square')).toBe('Completing The Square')
  })

  it('loads photographed problems including MDX', () => {
    const problems = loadProblems()
    expect(problems.map((problem) => problem.id).sort()).toEqual([
      'completing-the-square',
      'triangle-inequality',
    ])
    const algebra = getProblem('completing-the-square')
    expect(algebra?.topic).toBe('algebra')
    expect(algebra?.answer).toBe('3')
    expect(algebra?.Mdx).toBeTypeOf('function')
    expect(getProblem('triangle-inequality')?.Mdx).toBeUndefined()
    expect(getProblem('missing')).toBeUndefined()
  })
})
