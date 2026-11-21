import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { imageExtFromFile, isAllowedImageType } from '../lib/image-file.ts'
import { TOPICS } from '../topics.ts'

export function readDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the image.'))
    reader.readAsDataURL(file)
  })
}

export function Author({ allowAuthoring = import.meta.env.DEV }: { allowAuthoring?: boolean } = {}) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!allowAuthoring) {
    return (
      <p className="text-ink/70">
        Authoring is only available in local development. Add photos to the repo, then push.
      </p>
    )
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) {
      setError('Choose or capture a photo of the problem.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const imageBase64 = await readDataUrl(file)
      const response = await fetch(`${import.meta.env.BASE_URL}__author/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          topic: topic || undefined,
          imageBase64,
          imageExt: imageExtFromFile(file),
        }),
      })
      const body = (await response.json()) as { id?: string; error?: string }
      if (!response.ok || !body.id) {
        throw new Error(body.error || 'Could not save the problem.')
      }
      navigate(`/problem/${body.id}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the problem.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-serif text-4xl tracking-tight text-ink">Add from photo</h1>
      <p className="mt-3 text-ink/70">
        Saves a problem folder on this machine. Commit and push to publish on GitHub Pages.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-ink">Title</span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded border border-ink/20 bg-paper-2 px-3 py-2 text-ink outline-none focus:border-clay"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Topic</span>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="mt-1 w-full rounded border border-ink/20 bg-paper-2 px-3 py-2 text-ink outline-none focus:border-clay"
          >
            <option value="">Unsorted (All only)</option>
            {TOPICS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Photo</span>
          <input
            required
            type="file"
            accept="image/*"
            capture="environment"
            className="mt-1 block w-full text-sm text-ink/80"
            onChange={(event) => {
              const next = event.target.files?.[0] ?? null
              if (next && !isAllowedImageType(next.type)) {
                setError('Use a jpg, png, webp, or svg image.')
                setFile(null)
                setPreview(null)
                return
              }
              setError(null)
              setFile(next)
              setPreview(next ? URL.createObjectURL(next) : null)
            }}
          />
        </label>
        {preview ? (
          <img src={preview} alt="Selected problem" className="max-h-64 w-full rounded border border-ink/10 object-contain" />
        ) : null}
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save problem'}
        </button>
      </form>
    </div>
  )
}
