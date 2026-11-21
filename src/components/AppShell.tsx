import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar.tsx'

const STORAGE_KEY = 'sidebar-collapsed'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  function toggle() {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setCollapsed((value) => !value)
      return
    }
    setMobileOpen((value) => !value)
  }

  return (
    <div className="min-h-svh bg-paper text-ink">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={toggle}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className={[
          'flex min-h-svh flex-col transition-[margin] duration-200',
          collapsed ? 'md:ml-14' : 'md:ml-64',
        ].join(' ')}
      >
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-ink/10 bg-paper/90 px-4 backdrop-blur">
          <button
            type="button"
            className="rounded p-2 text-ink hover:bg-ink/5 md:hidden"
            aria-label="Open topics"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>
          <Link to="/" className="font-serif text-lg tracking-tight text-ink">
            Annotated math problems
          </Link>
        </header>
        <main className="flex-1 px-4 py-8 md:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
