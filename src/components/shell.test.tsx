import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell.tsx'
import { Sidebar } from './Sidebar.tsx'

describe('AppShell', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles the desktop sidebar', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: 'Open topics' }))
    expect(screen.getByRole('button', { name: 'Close topics' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close topics' }))
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(localStorage.getItem('sidebar-collapsed')).toBe('1')
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument()
  })

  it('opens the mobile drawer', async () => {
    const user = userEvent.setup()
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
        onchange: null,
      }) as MediaQueryList
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<p>Home outlet</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(screen.getByRole('button', { name: 'Close topics' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close topics' }))
    expect(screen.queryByRole('button', { name: 'Close topics' })).not.toBeInTheDocument()
  })

  it('treats blocked storage as expanded', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    )
    expect(screen.getByText('Topics')).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})

describe('Sidebar', () => {
  it('hides labels when collapsed on desktop', () => {
    render(
      <MemoryRouter>
        <Sidebar collapsed mobileOpen={false} onToggle={() => undefined} onCloseMobile={() => undefined} />
      </MemoryRouter>,
    )
    expect(screen.queryByText('Topics')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument()
  })

  it('shows labels in the mobile overlay even when collapsed', () => {
    render(
      <MemoryRouter>
        <Sidebar collapsed mobileOpen onToggle={() => undefined} onCloseMobile={() => undefined} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Topics')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Add from photo' })).toBeInTheDocument()
  })

  it('hides the author link when disabled', () => {
    render(
      <MemoryRouter>
        <Sidebar
          collapsed={false}
          mobileOpen
          onToggle={() => undefined}
          onCloseMobile={() => undefined}
          showAuthorLink={false}
        />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('link', { name: 'Add from photo' })).not.toBeInTheDocument()
  })
})
