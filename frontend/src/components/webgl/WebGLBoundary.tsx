import { Component, type ReactNode, createRef } from 'react'

interface WebGLBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface WebGLBoundaryState {
  hasError: boolean
  contextLost: boolean
}

/**
 * Catches WebGL/Three.js failures in two distinct ways, because they are
 * two genuinely different failure modes:
 *
 * 1. Initialization failures (disabled GPU, blocked hardware acceleration,
 *    old browsers) throw a JS exception during WebGLRenderer construction —
 *    caught here via the standard React error boundary lifecycle.
 *
 * 2. Context LOSS (constrained/sandboxed environments reclaiming the GPU
 *    mid-session, throttling, tab backgrounding) does NOT throw — it fires
 *    a `webglcontextlost` DOM event on the <canvas> element, which a React
 *    error boundary cannot intercept. Left unhandled, the canvas goes blank/
 *    transparent while still covering whatever is behind it, which is what
 *    produced the "fades to white" symptom: a dead, transparent WebGL layer
 *    sitting on top of the working CSS background, blocking it from view.
 *
 * This boundary listens for that event directly on its DOM subtree and
 * falls back the same way it does for a thrown init error.
 */
export class WebGLBoundary extends Component<WebGLBoundaryProps, WebGLBoundaryState> {
  private containerRef = createRef<HTMLDivElement>()

  constructor(props: WebGLBoundaryProps) {
    super(props)
    this.state = { hasError: false, contextLost: false }
    this.handleContextLost = this.handleContextLost.bind(this)
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.warn('[WebGLBoundary] Falling back — WebGL init failed:', error)
    }
  }

  componentDidMount() {
    // webglcontextlost fires on the canvas itself; listening with capture
    // on the container catches it regardless of how deep the canvas is nested.
    this.containerRef.current?.addEventListener('webglcontextlost', this.handleContextLost, true)
  }

  componentWillUnmount() {
    this.containerRef.current?.removeEventListener('webglcontextlost', this.handleContextLost, true)
  }

  handleContextLost(event: Event) {
    event.preventDefault()
    if (import.meta.env.DEV) {
      console.warn('[WebGLBoundary] Falling back — WebGL context lost mid-session')
    }
    this.setState({ contextLost: true })
  }

  render() {
    if (this.state.hasError || this.state.contextLost) {
      return this.props.fallback ?? <div className="h-full w-full bg-void-radial" />
    }
    return <div ref={this.containerRef} className="contents">{this.props.children}</div>
  }
}
