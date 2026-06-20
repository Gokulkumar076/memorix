import { Component, type ReactNode } from 'react'

interface WebGLBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface WebGLBoundaryState {
  hasError: boolean
}

/**
 * Catches WebGL/Three.js initialization failures (disabled GPU, blocked
 * hardware acceleration, sandboxed environments, old browsers) and falls
 * back to a plain background instead of taking down the entire page.
 *
 * This is necessary because a thrown error during WebGLRenderer creation
 * is an uncaught exception that React treats as fatal to the whole tree
 * unless an error boundary explicitly contains it.
 */
export class WebGLBoundary extends Component<WebGLBoundaryProps, WebGLBoundaryState> {
  constructor(props: WebGLBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // Swallow silently in production; this is an expected, handled fallback
    // path (WebGL unavailable), not a real bug to surface to the user.
    if (import.meta.env.DEV) {
      console.warn('[WebGLBoundary] Falling back — WebGL unavailable:', error)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div className="h-full w-full bg-void-radial" />
    }
    return this.props.children
  }
}
