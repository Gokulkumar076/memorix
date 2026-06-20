import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Suspense, lazy, useRef, useState, useEffect } from 'react'
import { Sparkles, Brain, Zap, BarChart3, Globe2, Layers, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Magnetic } from '@/components/ui/Magnetic'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { KineticNumber } from '@/components/ui/KineticNumber'
import { WebGLBoundary } from '@/components/webgl/WebGLBoundary'
import { isWebGLAvailable } from '@/lib/webgl-check'

const MemoryTraceField = lazy(() =>
  import('@/components/webgl/MemoryTraceField').then((m) => ({ default: m.MemoryTraceField }))
)

const features = [
  {
    icon: Brain,
    title: 'FSRS scheduling',
    description: "A live model of your memory curve — every review recalculates exactly when you'll next forget.",
    glow: 'synapse' as const,
  },
  {
    icon: Zap,
    title: 'AI-generated decks',
    description: 'Name a topic. Get a full deck of structured flashcards in seconds, not hours.',
    glow: 'recall' as const,
  },
  {
    icon: BarChart3,
    title: 'Retention analytics',
    description: 'Heatmaps, decay curves, per-deck stability — see your memory as data, not a guess.',
    glow: 'mint' as const,
  },
  {
    icon: Globe2,
    title: 'Offline-first',
    description: 'Study with zero signal. Every review queues locally and syncs the second you reconnect.',
    glow: 'decay' as const,
  },
  {
    icon: Layers,
    title: 'Four card formats',
    description: 'Basic, cloze, image, multiple choice — one scheduling engine drives all of them.',
    glow: 'synapse' as const,
  },
  {
    icon: Sparkles,
    title: 'Built to compound',
    description: 'XP, streaks, levels — engineered to reward showing up daily, not cramming once.',
    glow: 'recall' as const,
  },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    setWebglOk(isWebGLAvailable())
  }, [])

  return (
    <div className="min-h-screen overflow-x-clip bg-void-950">
      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-synapse-500 flex items-center justify-center shadow-glow-synapse">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Memorix</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost">Sign in</Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* HERO — oversized type over the WebGL memory trace field */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center px-6 lg:px-12">
        <div className="absolute inset-0 -z-0">
          {webglOk ? (
            <WebGLBoundary fallback={<div className="h-full w-full bg-void-radial" />}>
              <Suspense fallback={<div className="h-full w-full bg-void-radial" />}>
                <MemoryTraceField className="h-full w-full opacity-90" density={1.1} />
              </Suspense>
            </WebGLBoundary>
          ) : (
            <div className="h-full w-full bg-void-radial" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void-950/20 to-void-950" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 max-w-[1600px] mx-auto w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-mono text-recall-300 mb-8"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-recall-400 animate-pulse-glow" />
            Powered by FSRS v4.5
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-mega font-display font-medium text-balance"
          >
            Forget the<br />
            <span className="text-gradient-synapse italic">forgetting</span><br />
            curve.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-lg sm:text-xl text-void-200 max-w-xl mt-8 mb-10 text-balance"
          >
            Memorix builds a live model of your memory and reviews every card
            at the exact moment you're about to lose it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <Link to="/register">
                <Button size="xl">
                  Start learning free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </Magnetic>
            <Link to="/login" className="btn-secondary px-7 py-3.5 rounded-xl text-base">
              Sign in
            </Link>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-void-400">
          <span className="text-xs font-mono uppercase tracking-[0.25em]">scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="h-8 w-px bg-gradient-to-b from-void-400 to-transparent"
          />
        </div>
      </section>

      {/* STATS STRIP — oversized kinetic numbers, the product's actual content */}
      <section className="relative px-6 lg:px-12 py-20 border-y border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {[
            { value: 4, suffix: '', label: 'card formats' },
            { value: 90, suffix: '%', label: 'target retention' },
            { value: 100, suffix: '%', label: 'offline-ready' },
            { value: 0, suffix: '', label: 'cram sessions needed', prefix: '' },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1}>
              <KineticNumber
                value={stat.value}
                suffix={stat.suffix}
                className="text-huge block text-ghost"
              />
              <p className="label-eyebrow mt-2">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES — sharp glass cards with per-card glow signal */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-28">
        <Reveal className="mb-16 max-w-2xl">
          <p className="label-eyebrow mb-4">Built for retention, not vibes</p>
          <h2 className="text-huge font-display font-medium text-balance">
            Every feature protects <span className="text-gradient-synapse italic">one</span> thing.
          </h2>
        </Reveal>

        <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.08}>
          {features.map((f) => (
            <RevealItem key={f.title}>
              <Card hover glow={f.glow} className="h-full group">
                <div className="h-12 w-12 rounded-xl bg-synapse-500/15 flex items-center justify-center text-synapse-300 mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-medium text-ghost mb-2.5">{f.title}</h3>
                <p className="text-sm text-void-300 leading-relaxed">{f.description}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* CTA — full-bleed oversized close */}
      <section className="relative px-6 lg:px-12 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-void-radial" />
        <Reveal className="relative max-w-[1600px] mx-auto text-center">
          <h2 className="text-mega font-display font-medium text-balance mb-10">
            Your memory,<br />
            <span className="text-gradient-synapse italic">finally</span> optimized.
          </h2>
          <Magnetic>
            <Link to="/register" className="inline-block">
              <Button size="xl">
                Create your free account <ArrowUpRight className="h-5 w-5" />
              </Button>
            </Link>
          </Magnetic>
        </Reveal>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-void-500 font-mono">
        © {new Date().getFullYear()} Memorix — built on the FSRS open scheduling algorithm.
      </footer>
    </div>
  )
}
