import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Home } from './Home.tsx'
import { ProblemPage } from './ProblemPage.tsx'
import { Author, readDataUrl } from './Author.tsx'

function renderPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topic/:slug" element={<Home />} />
        <Route path="/problem/:id" element={<ProblemPage />} />
        <Route path="/author" element={<Author />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, file?: File) {
  await user.type(screen.getByLabelText('Title'), 'New problem')
  if (file) {
    fireEvent.change(screen.getByLabelText('Photo'), { target: { files: [file] } })
  }
  fireEvent.submit(screen.getByRole('button', { name: 'Save problem' }).closest('form')!)
}

describe('pages', () => {
  it('lists all problems', () => {
    renderPath('/')
    expect(screen.getByRole('heading', { name: 'Problems' })).toBeInTheDocument()
    expect(screen.getByText('Completing the square')).toBeInTheDocument()
    expect(screen.getByText('Triangle Inequality')).toBeInTheDocument()
  })

  it('filters algebra', () => {
    renderPath('/topic/algebra')
    expect(screen.getByRole('heading', { name: 'Algebra' })).toBeInTheDocument()
    expect(screen.getByText('Completing the square')).toBeInTheDocument()
    expect(screen.queryByText('Triangle Inequality')).not.toBeInTheDocument()
  })

  it('shows an empty geometry topic', () => {
    renderPath('/topic/geometry')
    expect(screen.getByText(/No problems in this topic yet/)).toBeInTheDocument()
  })

  it('renders an MDX problem page', () => {
    renderPath('/problem/completing-the-square')
    expect(screen.getByRole('heading', { name: 'Completing the square' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hint/i })).toBeInTheDocument()
  })

  it('renders a photo-only problem page', () => {
    renderPath('/problem/triangle-inequality')
    expect(screen.getByText(/photo-only/i)).toBeInTheDocument()
  })

  it('shows not found', () => {
    renderPath('/problem/missing')
    expect(screen.getByRole('heading', { name: 'Problem not found' })).toBeInTheDocument()
  })

  it('handles a missing route id', () => {
    render(
      <MemoryRouter>
        <ProblemPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Problem not found' })).toBeInTheDocument()
  })

  it('blocks authoring when disabled', () => {
    render(
      <MemoryRouter>
        <Author allowAuthoring={false} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/only available in local development/i)).toBeInTheDocument()
  })

  it('reads a data URL', async () => {
    const url = await readDataUrl(new Blob(['hi'], { type: 'text/plain' }))
    expect(url.startsWith('data:')).toBe(true)
  })

  it('rejects an unsupported photo type', async () => {
    render(
      <MemoryRouter>
        <Author allowAuthoring />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText('Photo'), {
      target: { files: [new File(['x'], 'x.gif', { type: 'image/gif' })] },
    })
    expect(screen.getByText(/Use a jpg, png, webp, or svg/i)).toBeInTheDocument()
  })

  it('saves a photo through the author form', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'saved' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(
      <MemoryRouter>
        <Author allowAuthoring />
      </MemoryRouter>,
    )
    await user.selectOptions(screen.getByLabelText('Topic'), 'algebra')
    await fillAndSubmit(user, new File(['x'], 'x.png', { type: 'image/png' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).topic).toBe('algebra')
    vi.unstubAllGlobals()
  })

  it('shows an API error', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Nope' }),
      }),
    )
    render(
      <MemoryRouter>
        <Author allowAuthoring />
      </MemoryRouter>,
    )
    await fillAndSubmit(user, new File(['x'], 'x.png', { type: 'image/png' }))
    expect(await screen.findByText('Nope')).toBeInTheDocument()
    vi.unstubAllGlobals()
  })

  it('shows a fallback error when the body has no message', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      }),
    )
    render(
      <MemoryRouter>
        <Author allowAuthoring />
      </MemoryRouter>,
    )
    await fillAndSubmit(user, new File(['x'], 'x.png', { type: 'image/png' }))
    expect(await screen.findByText('Could not save the problem.')).toBeInTheDocument()
    vi.unstubAllGlobals()
  })

  it('clears a photo selection', () => {
    render(
      <MemoryRouter>
        <Author allowAuthoring />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText('Photo'), {
      target: { files: [new File(['x'], 'x.png', { type: 'image/png' })] },
    })
    expect(screen.getByAltText('Selected problem')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Photo'), { target: { files: [] } })
    expect(screen.queryByAltText('Selected problem')).not.toBeInTheDocument()
  })

  it('accepts an image with an empty mime type', () => {
    render(
      <MemoryRouter>
        <Author allowAuthoring />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText('Photo'), {
      target: { files: [new File(['x'], 'x.jpg', { type: '' })] },
    })
    expect(screen.getByAltText('Selected problem')).toBeInTheDocument()
  })

  it('handles a thrown non-error', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('nope'))
    render(
      <MemoryRouter>
        <Author allowAuthoring />
      </MemoryRouter>,
    )
    await fillAndSubmit(user, new File(['x'], 'x.png', { type: 'image/png' }))
    expect(await screen.findByText('Could not save the problem.')).toBeInTheDocument()
    vi.unstubAllGlobals()
  })

  it('rejects a failed file read', async () => {
    class BrokenFileReader {
      onload: ((ev: ProgressEvent<FileReader>) => void) | null = null
      onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null
      error = null
      result = null
      readAsDataURL() {
        queueMicrotask(() => this.onerror?.(new Event('error') as ProgressEvent<FileReader>))
      }
      addEventListener() {}
      removeEventListener() {}
      dispatchEvent() {
        return false
      }
    }
    vi.stubGlobal('FileReader', BrokenFileReader)
    await expect(readDataUrl(new Blob(['x']))).rejects.toThrow('Could not read the image.')
    vi.unstubAllGlobals()
  })

  it('asks for a photo when submitting without one', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Author allowAuthoring />
      </MemoryRouter>,
    )
    await fillAndSubmit(user)
    expect(screen.getByText(/Choose or capture a photo/i)).toBeInTheDocument()
  })
})
