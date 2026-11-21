import { render, screen } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App, { AppRoutes } from './App.tsx'

describe('App', () => {
  it('renders routes in a memory router', () => {
    render(
      <MemoryRouter>
        <AppRoutes />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Problems' })).toBeInTheDocument()
  })

  it('wraps routes in a browser router', () => {
    expect(App().type).toBe(BrowserRouter)
  })
})
