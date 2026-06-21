import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LandingPage from '@/pages/LandingPage'

/**
 * Regression guard: tsc and vitest's unit tests never actually mount pages
 * in a browser-like environment, which is exactly how the requestIdleCallback
 * misuse bug shipped (it's a runtime TypeError, invisible to type-checking).
 * This test renders the real page tree in jsdom to catch that whole class
 * of "compiles fine, throws on mount" bug before it reaches production.
 */
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('LandingPage smoke test', () => {
  it('mounts without throwing', () => {
    expect(() => renderWithProviders(<LandingPage />)).not.toThrow()
  })

  it('renders the hero headline', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByText(/Forget the/i)).toBeInTheDocument()
  })

  it('renders the get started CTA', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getAllByText(/Get started/i).length).toBeGreaterThan(0)
  })
})
