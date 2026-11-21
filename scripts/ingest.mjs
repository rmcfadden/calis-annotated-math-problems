import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const PROBLEMS_DIR = path.resolve('src/content/problems')
const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg'])

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseArgs(argv) {
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

const { positional, flags } = parseArgs(process.argv.slice(2))
const imagePath = positional[0]

if (!imagePath) {
  console.error('Usage: npm run ingest -- path/to/photo.jpg --topic algebra --title "My problem"')
  process.exit(1)
}

const resolved = path.resolve(imagePath)
if (!fs.existsSync(resolved)) {
  console.error(`No file at ${resolved}`)
  process.exit(1)
}

const ext = path.extname(resolved).toLowerCase()
if (!ALLOWED.has(ext)) {
  console.error('Use a .jpg, .jpeg, .png, .webp, or .svg image.')
  process.exit(1)
}

const title =
  typeof flags.title === 'string'
    ? flags.title
    : path.basename(resolved, ext).replace(/[_-]+/g, ' ')
const slug = slugify(typeof flags.slug === 'string' ? flags.slug : title)
const topic = typeof flags.topic === 'string' ? flags.topic : undefined
const dir = path.join(PROBLEMS_DIR, slug)

if (fs.existsSync(dir)) {
  console.error(`A problem named "${slug}" already exists.`)
  process.exit(1)
}

const photoName = `photo${ext === '.jpeg' ? '.jpg' : ext}`
fs.mkdirSync(dir, { recursive: true })
fs.copyFileSync(resolved, path.join(dir, photoName))

const topicLine = topic ? `topic: ${topic}\n` : ''
fs.writeFileSync(
  path.join(dir, 'problem.mdx'),
  `---\ntitle: ${JSON.stringify(title)}\n${topicLine}---\n`,
)

console.log(`Wrote ${path.relative(process.cwd(), dir)}`)
