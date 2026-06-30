import { cn } from '@/lib/utils'

/**
 * AuroraField — pure CSS animated background. No canvas, no WebGL.
 * Larger, more vivid blobs + a subtle grid overlay for texture depth.
 */
export function AuroraField({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-void-950', className)}>

      {/* Grid overlay — gives the gradient field texture and depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Blob 1 — large violet, top-left, slow drift */}
      <div
        className="absolute rounded-full blur-[120px] animate-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.7) 0%, transparent 70%)',
          width: '80%',
          height: '80%',
          top: '-20%',
          left: '-20%',
          animationDuration: '12s',
        }}
      />

      {/* Blob 2 — large cyan, bottom-right */}
      <div
        className="absolute rounded-full blur-[140px] animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.55) 0%, transparent 70%)',
          width: '75%',
          height: '75%',
          bottom: '-25%',
          right: '-20%',
          animationDelay: '-5s',
          animationDuration: '10s',
        }}
      />

      {/* Blob 3 — medium violet accent, center */}
      <div
        className="absolute rounded-full blur-[100px] animate-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 60%)',
          width: '50%',
          height: '50%',
          top: '30%',
          left: '35%',
          animationDelay: '-3s',
          animationDuration: '14s',
        }}
      />

      {/* Blob 4 — small hot accent, top-right */}
      <div
        className="absolute rounded-full blur-[80px] animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(251,112,55,0.35) 0%, transparent 70%)',
          width: '35%',
          height: '35%',
          top: '-5%',
          right: '5%',
          animationDelay: '-7s',
          animationDuration: '9s',
        }}
      />

      {/* Vignette — subtle depth cue only, kept light so it doesn't compound with other darkening layers */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(5,3,9,0.35) 100%)',
        }}
      />

      {/* Grain — subtle film texture */}
      <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-60" />
    </div>
  )
}
