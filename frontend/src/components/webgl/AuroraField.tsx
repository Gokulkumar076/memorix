import { cn } from '@/lib/utils'

/**
 * AuroraField — pure CSS animated background. No canvas, no WebGL, no
 * requestAnimationFrame loop, no getBoundingClientRect timing dependency,
 * no JS that can silently fail. Three large radial-gradient blobs animate
 * via CSS @keyframes (defined in tailwind.config.js / index.css), composited
 * with the browser's own GPU-accelerated CSS pipeline — the same mechanism
 * that animates every transform/opacity transition elsewhere in this app
 * and has had zero reported issues.
 *
 * This intentionally replaces an earlier Canvas2D version that suffered a
 * silent failure mode: canvas dimensions read via getBoundingClientRect()
 * during the very first paint, before layout/animation had settled, could
 * come back zero-sized with no error — leaving a blank, working-as-coded
 * but visually broken canvas with nothing in the console to flag it.
 * Pure CSS has no equivalent failure surface: if the div exists, the
 * background paints, full stop.
 */
export function AuroraField({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-void-950', className)}>
      <div
        className="absolute -top-1/4 -left-1/4 h-[70%] w-[70%] rounded-full opacity-40 blur-3xl animate-float-slow"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[70%] w-[70%] rounded-full opacity-35 blur-3xl animate-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.45) 0%, transparent 70%)',
          animationDelay: '-4s',
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 h-[50%] w-[50%] -translate-x-1/2 rounded-full opacity-25 blur-3xl animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
          animationDelay: '-2s',
        }}
      />
      {/* Static grain texture for depth, no animation cost */}
      <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-50" />
    </div>
  )
}
