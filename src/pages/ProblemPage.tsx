import { Link, useParams } from 'react-router-dom'
import { mdxComponents } from '../components/widgets/mdx-components.ts'
import { ProblemProvider } from '../lib/problem-context.ts'
import { getProblem } from '../lib/problems.ts'
import { topicById } from '../topics.ts'

export function ProblemPage() {
  const { id } = useParams()
  const problem = id ? getProblem(id) : undefined

  if (!problem) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl text-ink">Problem not found</h1>
        <Link to="/" className="mt-4 inline-block text-clay underline">
          Back to all problems
        </Link>
      </div>
    )
  }

  const topic = topicById(problem.topic)
  const Mdx = problem.Mdx

  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs font-medium tracking-[0.2em] text-ink/50 uppercase">
        {topic?.label ?? 'Unsorted'}
      </p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">{problem.title}</h1>
      <figure className="mt-8 overflow-hidden rounded-md border border-ink/10 bg-paper-2 shadow-sm">
        <img src={problem.photoUrl} alt={problem.title} className="block w-full" />
      </figure>
      {Mdx ? (
        <ProblemProvider value={problem}>
          <div className="problem-prose mt-8">
            <Mdx components={mdxComponents} />
          </div>
        </ProblemProvider>
      ) : (
        <p className="mt-8 text-ink/65">
          This problem is photo-only so far. Add a{' '}
          <code className="rounded bg-paper-2 px-1.5 py-0.5 text-sm">problem.mdx</code> beside the
          photo for hints, answers, and other widgets.
        </p>
      )}
    </article>
  )
}
