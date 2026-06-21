import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'
import OnboardingPage from '@/pages/OnboardingPage'

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Auth and utility pages — mount smoke tests', () => {
  it('LoginPage mounts without throwing', () => {
    expect(() => renderWithProviders(<LoginPage />)).not.toThrow()
  })

  it('LoginPage renders the sign-in form', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
  })

  it('RegisterPage mounts without throwing', () => {
    expect(() => renderWithProviders(<RegisterPage />)).not.toThrow()
  })

  it('NotFoundPage mounts without throwing', () => {
    expect(() => renderWithProviders(<NotFoundPage />)).not.toThrow()
  })

  it('OnboardingPage mounts without throwing', () => {
    expect(() => renderWithProviders(<OnboardingPage />)).not.toThrow()
  })
})
