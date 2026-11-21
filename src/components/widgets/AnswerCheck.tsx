import { useState, type FormEvent } from 'react'
import { answersMatch } from '../../lib/answers.ts'
import { useProblem } from '../../lib/problem-context.ts'
import { isSolved, markSolved } from '../../lib/progress.ts'

export function AnswerCheck() {
  const problem = useProblem()
  const [value, setValue] = useState('')
  const [solved, setSolved] = useState(() => isSolved(problem.id))
  const [wrong, setWrong] = useState(false)

  if (!problem.answer) return null
  const expected = problem.answer

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (answersMatch(expected, value)) {
      markSolved(problem.id)
      setSolved(true)
      setWrong(false)
      return
    }
    setWrong(true)
  }

  if (solved) {
    return (
      <p className="my-5 rounded-md border border-moss/30 bg-moss/10 px-4 py-3 text-sm text-moss">
        Correct. This one is marked solved on this browser.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="my-5 rounded-md border border-ink/15 bg-paper-2 px-4 py-4">
      <label htmlFor={`answer-${problem.id}`} className="block text-sm font-medium text-ink">
        Your answer
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id={`answer-${problem.id}`}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setWrong(false)
          }}
          className="min-w-[12rem] flex-1 rounded border border-ink/20 bg-paper px-3 py-2 text-ink outline-none focus:border-clay"
        />
        <button
          type="submit"
          className="rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
        >
          Check
        </button>
      </div>
      {wrong ? <p className="mt-2 text-sm text-clay">Try again.</p> : null}
    </form>
  )
}
