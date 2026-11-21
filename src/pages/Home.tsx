import { Link, useParams } from 'react-router-dom'
import { loadProblems } from '../lib/problems.ts'
import { topicById, topicBySlug } from '../topics.ts'

export function Home() {
  const { slug } = useParams()
  const topic = topicBySlug(slug)
  const problems = loadProblems().filter((problem) =>
    topic ? problem.topic === topic.id : true,
  )

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-medium tracking-[0.2em] text-ink/50 uppercase">
        {topic ? topic.label : 'All topics'}
      </p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink md:text-5xl">
        {topic ? topic.label : 'Problems'}
      </h1>
      <p className="mt-3 max-w-xl text-ink/70">
        {topic
          ? `Problems filed under ${topic.label}. Empty topics stay in the sidebar until you add photos.`
          : 'Each card is a photographed problem. Open one to try hints, answers, and solutions when they exist.'}
      </p>

      {problems.length === 0 ? (
        <p className="mt-10 border border-dashed border-ink/20 px-4 py-10 text-center text-ink/60">
          No problems in this topic yet. Drop a photo into{' '}
          <code className="rounded bg-paper-2 px-1.5 py-0.5 text-sm">src/content/problems</code> or
          use Add from photo while developing.
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => (
            <li key={problem.id}>
              <Link
                to={`/problem/${problem.id}`}
                className="group block overflow-hidden rounded-md border border-ink/10 bg-paper-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-ink/5">
                  <img
                    src={problem.photoUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="px-4 py-3">
                  <h2 className="font-serif text-lg text-ink">{problem.title}</h2>
                  <p className="mt-1 text-sm text-ink/55">
                    {topicById(problem.topic)?.label ?? 'Unsorted'}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
