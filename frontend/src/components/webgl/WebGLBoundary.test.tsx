import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WebGLBoundary } from '@/components/webgl/WebGLBoundary'

/**
 * Regression guard for the "fades to white" bug: a WebGL canvas going dead
 * mid-session (THREE.WebGLRenderer: Context Lost) does NOT throw a JS error
 * — it fires a `webglcontextlost` DOM event, which a standard React error
 * boundary's componentDidCatch cannot intercept at all. Left unhandled, the
 * canvas stays mounted but renders nothing, sitting transparently on top of
 * whatever background is meant to show through — which is exactly what
 * produced the symptom (correct background, then fade to blank/white as
 * the dead canvas silently took over the layer).
 */
describe('WebGLBoundary context-loss handling', () => {
  it('renders children normally before any context loss', () => {
    render(
      <WebGLBoundary fallback={<div data-testid="fallback">fallback</div>}>
        <div data-testid="webgl-content">3D content</div>
      </WebGLBoundary>
    )
    expect(screen.getByTestId('webgl-content')).toBeInTheDocument()
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument()
  })

  it('switches to the fallback when a webglcontextlost event fires', () => {
    render(
      <WebGLBoundary fallback={<div data-testid="fallback">fallback</div>}>
        <div data-testid="webgl-content">3D content</div>
      </WebGLBoundary>
    )

    expect(screen.getByTestId('webgl-content')).toBeInTheDocument()

    const event = new Event('webglcontextlost', { bubbles: true, cancelable: true })
    fireEvent(screen.getByTestId('webgl-content'), event)

    expect(screen.queryByTestId('webgl-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('fallback')).toBeInTheDocument()
  })

  it('renders nothing (not a blank covering layer) when fallback is null', () => {
    const { container } = render(
      <WebGLBoundary fallback={null}>
        <div data-testid="webgl-content">3D content</div>
      </WebGLBoundary>
    )

    const event = new Event('webglcontextlost', { bubbles: true, cancelable: true })
    fireEvent(screen.getByTestId('webgl-content'), event)

    expect(screen.queryByTestId('webgl-content')).not.toBeInTheDocument()
    // React renders `null` as an empty container, not a leftover dead canvas wrapper.
    expect(container.textContent).toBe('')
    expect(container.querySelector('[data-testid="webgl-content"]')).toBeNull()
  })
})
