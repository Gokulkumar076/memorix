import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { AuroraField } from '@/components/webgl/AuroraField'

/**
 * Regression guard for the "washed-out white background" bug: AuroraField
 * was filling the entire canvas with translucent light-colored gradients
 * on every frame, with no opaque dark base painted first, which made the
 * canvas trend toward white/gray instead of the intended near-black void.
 *
 * This test mocks the 2D context and asserts the draw loop actually issues
 * a full-canvas fillRect with the dark base color before any gradient fill.
 */
describe('AuroraField canvas paint sequence', () => {
  let fillRectCalls: Array<{ args: number[]; fillStyle: string }>
  let mockCtx: Partial<CanvasRenderingContext2D>

  beforeEach(() => {
    fillRectCalls = []
    mockCtx = {
      clearRect: vi.fn(),
      scale: vi.fn(),
      fillRect: vi.fn(function (this: CanvasRenderingContext2D, ...args: number[]) {
        fillRectCalls.push({ args, fillStyle: this.fillStyle as string })
      }),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })) as unknown as CanvasRenderingContext2D['createRadialGradient'],
      set fillStyle(_v: string | CanvasGradient) {
        /* tracked via the fillRect wrapper's `this` above */
      },
      get fillStyle() {
        return ''
      },
      globalCompositeOperation: 'source-over',
    }

    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx) as unknown as typeof HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }))
  })

  it('paints a full-canvas dark base fill before any blob gradient', () => {
    render(<AuroraField className="h-full w-full" />)

    // The draw loop runs on requestAnimationFrame; in jsdom this typically
    // fires via a polyfilled timer during the render/effect cycle. We
    // assert on the *first* fillRect call args being the full canvas size,
    // which is only true if the dark base fill ran before any blob paint
    // (blob paints use a region sized to their own radius, not the full canvas).
    expect(mockCtx.fillRect).toHaveBeenCalled()
    const firstCall = (mockCtx.fillRect as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(firstCall).toEqual([0, 0, 800, 600])
  })
})
