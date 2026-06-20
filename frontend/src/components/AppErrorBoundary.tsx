import { Component, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface AppErrorBoundaryState {
  hasError: boolean
}

/**
 * Top-level safety net. If anything anywhere in the app throws during
 * render (not just WebGL — any uncaught error), this shows a recoverable
 * screen instead of a silent blank page with no way forward for the user.
 */
export class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('[AppErrorBoundary] Uncaught render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-void-950 px-4">
          <div className="text-center max-w-sm">
            <h1 className="text-2xl font-display font-medium text-ghost mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-void-300 mb-6">
              The page hit an unexpected error. Reloading usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
