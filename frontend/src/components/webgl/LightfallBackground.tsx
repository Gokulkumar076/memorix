import { Component, type ReactNode, lazy, Suspense } from 'react'
import { AuroraField } from './AuroraField'

const LightfallLazy = lazy(() => import('./Lightfall'))

/**
 * Error boundary for Lightfall — catches WebGL init failures and context
 * loss events. AuroraField (pure CSS) is always rendered underneath as the
 * base layer, so if Lightfall fails at any point the page still looks good.
 */
class LightfallBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  private containerRef: HTMLDivElement | null = null

  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { failed: false }
    this.handleContextLost = this.handleContextLost.bind(this)
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidMount() {
    // Capture webglcontextlost from any canvas in this subtree
    this.containerRef?.addEventListener('webglcontextlost', this.handleContextLost, true)
  }

  componentWillUnmount() {
    this.containerRef?.removeEventListener('webglcontextlost', this.handleContextLost, true)
  }

  handleContextLost(e: Event) {
    e.preventDefault()
    this.setState({ failed: true })
  }

  render() {
    if (this.state.failed) return null
    return (
      <div ref={(el) => { this.containerRef = el }} className="contents">
        {this.props.children}
      </div>
    )
  }
}

interface LightfallBackgroundProps {
  className?: string
  /** Memorix brand palette — synapse violet + recall cyan + void deep */
  colors?: string[]
  backgroundColor?: string
}

/**
 * Full-page background using the Lightfall WebGL streak effect.
 * AuroraField CSS gradient is always the base layer — Lightfall fades
 * in on top. If WebGL is unavailable or context is lost at any point,
 * AuroraField remains visible and the page looks correct.
 */
export function LightfallBackground({
  className,
  colors = ['#a78bfa', '#7c3aed', '#67e8f9', '#22d3ee'],
  backgroundColor = '#1e1b4b',
}: LightfallBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {/* Always-present CSS baseline */}
      <AuroraField className="absolute inset-0 h-full w-full" />

      {/* WebGL enhancement — fades in on top when available */}
      <div className="absolute inset-0">
        <LightfallBoundary>
          <Suspense fallback={null}>
            <LightfallLazy
              colors={colors}
              backgroundColor={backgroundColor}
              speed={0.55}
              streakCount={9}
              streakWidth={1.5}
              streakLength={1.6}
              glow={1.8}
              density={0.85}
              twinkle={0.9}
              zoom={2.2}
              backgroundGlow={0.55}
              opacity={1}
              mouseInteraction={true}
              mouseStrength={0.7}
              mouseRadius={0.85}
              mouseDampening={0.12}
            />
          </Suspense>
        </LightfallBoundary>
      </div>
    </div>
  )
}
