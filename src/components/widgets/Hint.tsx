import { useId, useState, type ReactNode } from 'react'

export function Hint({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="my-5 rounded-md border border-ink/15 bg-paper-2">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium tracking-wide text-ink"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        Hint
        <span className="text-ink/50">{open ? '−' : '+'}</span>
      </button>
      {open ? (
        <div id={panelId} className="border-t border-ink/10 px-4 py-3 text-[0.95rem] leading-relaxed text-ink/85">
          {children}
        </div>
      ) : null}
    </div>
  )
}
