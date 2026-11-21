import { NavLink } from 'react-router-dom'
import { TOPICS } from '../topics.ts'

type SidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  onToggle: () => void
  onCloseMobile: () => void
  showAuthorLink?: boolean
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded px-3 py-1.5 text-sm leading-snug',
    isActive ? 'bg-ink text-paper' : 'text-ink/80 hover:bg-ink/5 hover:text-ink',
  ].join(' ')

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggle,
  onCloseMobile,
  showAuthorLink = import.meta.env.DEV,
}: SidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/25 md:hidden"
          aria-label="Close topics"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-ink/10 bg-paper-2 transition-[width,transform] duration-200',
          collapsed ? 'md:w-14' : 'md:w-64',
          mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-ink/10 px-2">
          {!collapsed || mobileOpen ? (
            <span className="truncate px-2 font-serif text-base text-ink">Topics</span>
          ) : null}
          <button
            type="button"
            className="ml-auto rounded p-2 text-ink hover:bg-ink/5"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggle}
          >
            <span aria-hidden="true" className="block w-4 text-center">
              {collapsed ? '›' : '‹'}
            </span>
          </button>
        </div>

        <nav
          className={[
            'flex-1 overflow-y-auto px-2 py-3',
            collapsed && !mobileOpen ? 'hidden md:hidden' : '',
          ].join(' ')}
        >
          <NavLink to="/" end className={linkClass} onClick={onCloseMobile}>
            All problems
          </NavLink>
          <ul className="mt-3 space-y-0.5">
            {TOPICS.map((topic) => (
              <li key={topic.id}>
                <NavLink
                  to={`/topic/${topic.slug}`}
                  className={linkClass}
                  onClick={onCloseMobile}
                >
                  {topic.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {showAuthorLink ? (
            <NavLink
              to="/author"
              className={`${linkClass({ isActive: false })} mt-6 border border-dashed border-ink/20`}
              onClick={onCloseMobile}
            >
              Add from photo
            </NavLink>
          ) : null}
        </nav>
      </aside>
    </>
  )
}
