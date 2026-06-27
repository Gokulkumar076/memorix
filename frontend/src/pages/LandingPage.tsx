import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Brain, Zap, BarChart3, Globe2, Layers, Sparkles, ArrowRight, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { LightfallBackground } from '@/components/webgl/LightfallBackground'
import { cn } from '@/lib/utils'

/* ── Features ─────────────────────────────────────────────────────── */
const features = [
  { icon: Brain,    glow: 'synapse' as const, title: 'FSRS scheduling',   description: 'A live model of your memory — every review recalculates exactly when you\'ll next forget.' },
  { icon: Zap,      glow: 'recall'  as const, title: 'AI-generated decks', description: 'Name a topic. Get a full deck of structured flashcards in seconds, not hours.' },
  { icon: BarChart3, glow: 'mint'   as const, title: 'Deep analytics',     description: 'Retention curves, heatmaps, per-deck stability — see your memory as data.' },
  { icon: Globe2,   glow: 'decay'   as const, title: 'Offline-first',      description: 'Study with zero signal. Reviews queue locally and sync the moment you reconnect.' },
  { icon: Layers,   glow: 'synapse' as const, title: 'Four card formats',  description: 'Basic, cloze, image, multiple choice — one scheduling engine drives all of them.' },
  { icon: Sparkles, glow: 'recall'  as const, title: 'Built to compound',  description: 'XP, streaks, levels — engineered to reward daily consistency, not cramming.' },
]

/* ── Memorix wordmark SVG logo ────────────────────────────────────── */
function MemorizLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Memorix"
    >
      {/* Outer ring — represents the review cycle */}
      <circle cx="16" cy="16" r="14" stroke="url(#ringGrad)" strokeWidth="1.5" />
      {/* Inner neural node cluster */}
      <circle cx="16" cy="10" r="2.5" fill="url(#topGrad)" />
      <circle cx="22" cy="19" r="2" fill="url(#rightGrad)" />
      <circle cx="10" cy="19" r="2" fill="url(#leftGrad)" />
      {/* Connections */}
      <line x1="16" y1="12.5" x2="21" y2="17.5" stroke="rgba(139,92,246,0.5)" strokeWidth="1" />
      <line x1="16" y1="12.5" x2="11" y2="17.5" stroke="rgba(34,211,238,0.5)" strokeWidth="1" />
      <line x1="11.5" y1="19" x2="20.5" y2="19" stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
      {/* Centre dot */}
      <circle cx="16" cy="16" r="1.2" fill="white" opacity="0.9" />
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="topGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
        <radialGradient id="rightGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#22d3ee" />
        </radialGradient>
        <radialGradient id="leftGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/* ── Animated "forgetting curve" spark line ──────────────────────── */
function ForgettingCurveLine() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let frame: number
    let start: number | null = null
    const duration = 3200
    const animate = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setProgress(p)
      if (p < 1) frame = requestAnimationFrame(animate)
      else setTimeout(() => { start = null; setProgress(0); frame = requestAnimationFrame(animate) }, 600)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  const W = 220
  const H = 60
  const pts = Array.from({ length: 60 }, (_, i) => {
    const t = i / 59
    const y = H * 0.1 + (H * 0.8) * (1 - 1 / (1 + t * 2.8))
    return `${t * W},${y}`
  }).join(' ')

  const drawn = Math.round(progress * 60)
  const ptArr = pts.split(' ').slice(0, Math.max(2, drawn))

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="curveGrad" x1="0" y1="0" x2={W} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0aefa0" />
          <stop offset="60%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#fb7037" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {ptArr.length >= 2 && (
        <polyline
          points={ptArr.join(' ')}
          fill="none"
          stroke="url(#curveGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glow)"
        />
      )}
      {ptArr.length >= 2 && (() => {
        const last = ptArr[ptArr.length - 1].split(',')
        return <circle cx={last[0]} cy={last[1]} r="3.5" fill="#fff" filter="url(#glow)" />
      })()}
      <text x="2" y={H - 4} fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">0d</text>
      <text x={W - 20} y={H - 4} fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">30d</text>
    </svg>
  )
}

/* ── Marquee tag strip ────────────────────────────────────────────── */
const TAGS = ['FSRS v4.5', 'Spaced Repetition', 'AI Flashcards', 'Offline Study', 'Retention Analytics', 'Active Recall', 'Memory Science', 'Cloze Deletion']

function TagStrip() {
  return (
    <div className="relative overflow-hidden py-3 before:absolute before:left-0 before:inset-y-0 before:w-16 before:bg-gradient-to-r before:from-void-950 before:to-transparent before:z-10 after:absolute after:right-0 after:inset-y-0 after:w-16 after:bg-gradient-to-l after:from-void-950 after:to-transparent after:z-10">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="flex gap-3 w-max"
      >
        {[...TAGS, ...TAGS].map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-full glass px-3.5 py-1 text-[11px] font-mono text-void-300 border border-white/[0.06] whitespace-nowrap"
          >
            <span className="h-1 w-1 rounded-full bg-synapse-400" />
            {tag}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* ── Main page ────────────────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 60])
  const [scrolled, setScrolled]   = useState(false)

  useEffect(() => scrollY.on('change', y => setScrolled(y > 40)), [scrollY])

  return (
    <div className="min-h-screen overflow-x-clip bg-void-950">

      {/* ── NAV ────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 inset-x-0 z-30 flex justify-center px-4"
      >
        <motion.div
          animate={{ paddingLeft: scrolled ? 12 : 18, paddingRight: scrolled ? 10 : 14 }}
          className={cn(
            'flex items-center gap-5 rounded-full py-2 transition-all duration-500',
            scrolled ? 'glass-bright shadow-glow-synapse/15' : 'bg-transparent'
          )}
        >
          {/* Logo mark + wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <MemorizLogo size={28} />
            </motion.div>
            <span className="font-display font-extrabold text-base tracking-tight hidden sm:inline text-ghost">
              Memorix
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-void-300 border-l border-white/[0.08] pl-5">
            <Activity className="h-3 w-3 text-mint-500 animate-pulse" />
            <span>engine live</span>
          </div>

          <div className="flex items-center gap-2 border-l border-white/[0.08] pl-5">
            <Link to="/login" className="btn-ghost !px-3 !py-1.5 text-sm">Sign in</Link>
            <Link to="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </motion.div>
      </motion.nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[640px] max-h-[960px] overflow-hidden flex flex-col justify-center"
      >
        {/* Background */}
        <div className="absolute inset-0 -z-0">
          <LightfallBackground className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-void-950/50 via-transparent to-void-950" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-[1100px] mx-auto px-6 lg:px-12 pt-20"
        >

          {/* ── FSRS badge ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="flex items-center gap-2 mb-10"
          >
            <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-mono text-recall-300">
              <span className="h-1.5 w-1.5 rounded-full bg-recall-400 animate-pulse-glow" />
              Powered by FSRS v4.5
            </span>
          </motion.div>

          {/* ── Headline — asymmetric editorial layout ───────────── */}
          {/*
              Design intent: not centered. Left-anchored with an intentional
              gap on the right that's filled by the curve annotation — so the
              headline and the visual element read as one composed unit rather
              than two independent columns competing for attention.
          */}
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold leading-none text-mega max-w-[820px]"
            >
              {/* Line 1 — ghost white */}
              <span className="block text-ghost">Forget the</span>

              {/* Line 2 — gradient, italic for contrast */}
              <span className="block text-gradient-synapse italic">forgetting</span>

              {/* Line 3 — dimmed so the gradient line pops */}
              <span className="block text-void-200">curve.</span>
            </motion.h1>

            {/* Floating curve annotation — upper right of headline */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="absolute top-4 right-0 hidden lg:block"
            >
              <div className="glass rounded-2xl px-4 py-3 border border-white/[0.08]">
                <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider mb-2">
                  Memory decay — visualised
                </p>
                <ForgettingCurveLine />
                <div className="flex justify-between mt-2 text-[9px] font-mono">
                  <span className="text-mint-400">Strong</span>
                  <span className="text-synapse-400">Fading</span>
                  <span className="text-decay-400">Lost</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Subtext + CTA ───────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base sm:text-lg text-void-200 max-w-lg mt-7 mb-8 leading-relaxed"
          >
            Memorix builds a live model of your memory and schedules every card
            at the exact moment you're about to lose it — never a day earlier.
          </motion.p>

          {/* CTA row — no Magnetic wrapper on the primary button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link to="/register">
              <Button size="lg">
                Start for free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="btn-secondary !px-6 !py-3 !rounded-xl text-sm">
              Sign in
            </Link>
          </motion.div>

          {/* ── Divider line ────────────────────────────────────── */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
            className="glow-rule mt-12 mb-10"
          />

          {/* ── Key proof points — horizontal list, no stats numbers ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-wrap gap-x-8 gap-y-3"
          >
            {[
              { dot: 'bg-mint-500',    text: 'Schedules every review at the optimal moment'  },
              { dot: 'bg-synapse-400', text: 'AI generates full decks from any topic'          },
              { dot: 'bg-recall-400',  text: 'Works completely offline, syncs automatically'   },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', p.dot)} />
                <span className="text-sm text-void-300">{p.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5">
          <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-void-600">scroll</span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="h-7 w-px bg-gradient-to-b from-void-500 to-transparent"
          />
        </div>
      </section>

      {/* ── MARQUEE TAGS ───────────────────────────────────────────── */}
      <TagStrip />

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section className="max-w-[1100px] mx-auto px-6 lg:px-12 py-24">
        <Reveal className="mb-16">
          <p className="label-eyebrow mb-3">How it works</p>
          <h2 className="text-huge font-display font-extrabold max-w-xl">
            Every feature protects{' '}
            <span className="text-gradient-synapse">one thing</span>.
          </h2>
        </Reveal>

        <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.07}>
          {features.map(f => (
            <RevealItem key={f.title}>
              <Card hover glow={f.glow} className="h-full group cursor-default">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 14 }}
                  className="h-10 w-10 rounded-xl bg-synapse-500/10 flex items-center justify-center text-synapse-300 mb-4"
                >
                  <f.icon className="h-5 w-5" />
                </motion.div>
                <h3 className="font-display font-bold text-base text-ghost mb-1.5">{f.title}</h3>
                <p className="text-sm text-void-300 leading-relaxed">{f.description}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0">
          <LightfallBackground className="h-full w-full opacity-65" />
          <div className="absolute inset-0 bg-void-950/60" />
        </div>
        <Reveal className="relative max-w-[1100px] mx-auto text-center">
          <h2 className="text-huge font-display font-extrabold mb-4 max-w-2xl mx-auto">
            Your memory,{' '}
            <span className="text-gradient-synapse">finally</span>{' '}
            optimized.
          </h2>
          <p className="text-void-300 mb-10 max-w-md mx-auto">
            Join now and start building decks that actually stick.
          </p>
          <Link to="/register" className="inline-block">
            <Button size="xl">
              Create your free account <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-white/[0.06] py-7 text-center text-xs text-void-600 font-mono">
        © {new Date().getFullYear()} Memorix — built on the FSRS open scheduling algorithm.
      </footer>
    </div>
  )
}
