import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const DEFAULT_PROBLEMS_DIR = path.resolve('src/content/problems')
const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg'])

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parseArgs(argv) {
  const args = { positional: [], flags: {} }
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token.startsWith('--')) {
      const key = token.slice(2)
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) {
        args.flags[key] = true
      } else {
        args.flags[key] = next
        i += 1
      }
    } else {
      args.positional.push(token)
    }
  }
  return args
}

export function ingest(argv, options = {}) {
  const problemsDir = options.problemsDir || process.env.PROBLEMS_DIR || DEFAULT_PROBLEMS_DIR
  const { positional, flags } = parseArgs(argv)
  const imagePath = positional[0]

  if (!imagePath) {
    return { status: 1, error: 'Usage: npm run ingest -- path/to/photo.jpg --topic algebra --title "My problem"' }
  }

  const resolved = path.resolve(imagePath)
  if (!fs.existsSync(resolved)) {
    return { status: 1, error: `No file at ${resolved}` }
  }

  const ext = path.extname(resolved).toLowerCase()
  if (!ALLOWED.has(ext)) {
    return { status: 1, error: 'Use a .jpg, .jpeg, .png, .webp, or .svg image.' }
  }

  const title =
    typeof flags.title === 'string'
      ? flags.title
      : path.basename(resolved, ext).replace(/[_-]+/g, ' ')
  const slug = slugify(typeof flags.slug === 'string' ? flags.slug : title)
  const topic = typeof flags.topic === 'string' ? flags.topic : undefined
  const dir = path.join(problemsDir, slug)

  if (fs.existsSync(dir)) {
    return { status: 1, error: `A problem named "${slug}" already exists.` }
  }

  const photoName = `photo${ext === '.jpeg' ? '.jpg' : ext}`
  fs.mkdirSync(dir, { recursive: true })
  fs.copyFileSync(resolved, path.join(dir, photoName))

  const topicLine = topic ? `topic: ${topic}\n` : ''
  fs.writeFileSync(
    path.join(dir, 'problem.mdx'),
    `---\ntitle: ${JSON.stringify(title)}\n${topicLine}---\n`,
  )

  return { status: 0, dir }
}

export function isEntryPoint(metaUrl, entryPath) {
  if (!entryPath) return false
  return metaUrl === pathToFileURL(path.resolve(entryPath)).href
}

export function runCli(argv = process.argv.slice(2), io = console) {
  const result = ingest(argv)
  if (result.error) {
    io.error(result.error)
  } else {
    io.log(`Wrote ${path.relative(process.cwd(), result.dir)}`)
  }
  return result.status
}

export function maybeRunCli(metaUrl, entryPath, exitFn = process.exit) {
  if (isEntryPoint(metaUrl, entryPath)) {
    exitFn(runCli())
  }
}

maybeRunCli(import.meta.url, process.argv[1])
