import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * AuroraField — a CSS+Canvas2D animated background that requires zero WebGL.
 * This is the baseline experience for 100% of visitors. MemoryTraceField
 * (WebGL) layers on top as a progressive enhancement only when available —
 * this is never just a "fallback," it's designed to be good on its own.
 *
 * Draws soft drifting light masses (synapse violet / recall cyan) using
 * plain 2D canvas, plus a CSS-animated grain/glow layer for texture.
 */

interface Blob {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  hue: 'synapse' | 'recall'
  phase: number
}

const COLORS = {
  synapse: 'rgba(139, 92, 246,',
  recall: 'rgba(34, 211, 238,',
}

export function AuroraField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blobsRef = useRef<Blob[]>([])
  const rafRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()

    blobsRef.current = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.25 + Math.random() * 0.2,
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
      hue: i % 2 === 0 ? 'synapse' : 'recall',
      phase: Math.random() * Math.PI * 2,
    }))

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      t += 0.0035

      // Solid dark base every frame — this was missing, which let the
      // translucent blob gradients accumulate toward white/gray instead
      // of sitting on the intended near-black void background.
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#050309'
      ctx.fillRect(0, 0, width, height)

      ctx.globalCompositeOperation = 'lighter'

      for (const blob of blobsRef.current) {
        // gentle drift + mouse-reactive pull
        blob.x += blob.vx + (mouseRef.current.x - blob.x) * 0.00025
        blob.y += blob.vy + (mouseRef.current.y - blob.y) * 0.00025

        if (blob.x < -0.2 || blob.x > 1.2) blob.vx *= -1
        if (blob.y < -0.2 || blob.y > 1.2) blob.vy *= -1

        const px = blob.x * width
        const py = blob.y * height
        const pulse = 1 + Math.sin(t * 1.4 + blob.phase) * 0.12
        const radius = blob.r * Math.max(width, height) * pulse

        const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius)
        gradient.addColorStop(0, `${COLORS[blob.hue]} 0.35)`)
        gradient.addColorStop(0.5, `${COLORS[blob.hue]} 0.12)`)
        gradient.addColorStop(1, `${COLORS[blob.hue]} 0)`)

        // Fill only this blob's own bounding box, not the whole canvas —
        // painting the full canvas per-blob is what caused the wash-out.
        ctx.fillStyle = gradient
        ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2)
      }

      ctx.globalCompositeOperation = 'source-over'

      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Subtle static grain so the gradient field doesn't look like a flat web banner */}
      <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-60" />
      {/* Hairline drifting particles via pure CSS, layered for extra life at low cost */}
      <div className="absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-recall-300/40 animate-float-slow"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              animationDelay: `${(i % 7) * 0.6}s`,
              animationDuration: `${8 + (i % 5)}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
