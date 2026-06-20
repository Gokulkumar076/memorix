import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, ProgressBar } from '@/components/ui/Badge'

describe('Badge', () => {
  it('renders the given text', () => {
    render(<Badge>5 due</Badge>)
    expect(screen.getByText('5 due')).toBeInTheDocument()
  })
})

describe('ProgressBar', () => {
  it('shows the value/max label when showLabel is set', () => {
    render(<ProgressBar value={5} max={20} showLabel />)
    expect(screen.getByText('5 / 20')).toBeInTheDocument()
  })

  it('does not crash when max is 0', () => {
    render(<ProgressBar value={0} max={0} showLabel />)
    expect(screen.getByText('0 / 0')).toBeInTheDocument()
  })
})
