import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Brain, Zap, BarChart3, Globe2, Layers, Sparkles, ArrowRight, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { LightfallBackground } from '@/components/webgl/LightfallBackground'
import { cn } from '@/lib/utils'

/* ── Features ─────────────────────────────────────────────────────── */
const features = [
  { icon: Brain,     glow: 'synapse' as const, title: 'FSRS scheduling',    description: "A live model of your memory — every review recalculates exactly when you'll next forget." },
  { icon: Zap,       glow: 'recall'  as const, title: 'AI-generated decks',  description: 'Name a topic. Get a full deck of structured flashcards in seconds, not hours.' },
  { icon: BarChart3, glow: 'mint'    as const, title: 'Deep analytics',      description: 'Retention curves, heatmaps, per-deck stability — see your memory as data.' },
  { icon: Globe2,    glow: 'decay'   as const, title: 'Offline-first',       description: 'Study with zero signal. Reviews queue locally and sync the moment you reconnect.' },
  { icon: Layers,    glow: 'synapse' as const, title: 'Four card formats',   description: 'Basic, cloze, image, multiple choice — one scheduling engine drives all of them.' },
  { icon: Sparkles,  glow: 'recall'  as const, title: 'Built to compound',   description: 'XP, streaks, levels — engineered to reward daily consistency, not cramming.' },
]

/* ── SVG Logo ──────────────────────────────────────────────────────── */
function MemorizLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Memorix">
      <circle cx="16" cy="16" r="14" stroke="url(#rG)" strokeWidth="1.5" />
      <circle cx="16" cy="10" r="2.5" fill="url(#tG)" />
      <circle cx="22" cy="19" r="2"   fill="url(#rGr)" />
      <circle cx="10" cy="19" r="2"   fill="url(#lG)" />
      <line x1="16" y1="12.5" x2="21" y2="17.5" stroke="rgba(139,92,246,0.5)"  strokeWidth="1" />
      <line x1="16" y1="12.5" x2="11" y2="17.5" stroke="rgba(34,211,238,0.5)"  strokeWidth="1" />
      <line x1="11.5" y1="19" x2="20.5" y2="19" stroke="rgba(139,92,246,0.35)" strokeWidth="1" />
      <circle cx="16" cy="16" r="1.2" fill="white" opacity="0.9" />
      <defs>
        <linearGradient id="rG"  x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient>
        <radialGradient id="tG"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#7c3aed"/></radialGradient>
        <radialGradient id="rGr" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#67e8f9"/><stop offset="100%" stopColor="#22d3ee"/></radialGradient>
        <radialGradient id="lG"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#6d28d9"/></radialGradient>
      </defs>
    </svg>
  )
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef   = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  /*
   * SCROLL SMOOTHNESS FIX
   * ─────────────────────
   * Root cause of jitter: Framer Motion's useTransform maps scroll values
   * synchronously on every scroll event, but these values drive a motion.div
   * that causes layout/paint on the compositor thread out-of-step with the
   * browser's own scroll compositing. The canvas element inside also doesn't
   * benefit from the fixed-positioning trick when it's buried inside a
   * position:absolute container that scrolls with the page.
   *
   * Fix A — spring-smooth the scroll value before applying it to motion.div
   *   useSpring with a very low stiffness / high damping acts as a low-pass
   *   filter on the scroll position, eliminating frame-to-frame jitter from
   *   event coalescing while staying within 1-2 frames of actual scroll.
   *
   * Fix B — the Lightfall canvas is placed in a fixed-position wrapper that
   *   is unaffected by document scroll entirely. Scroll position doesn't
   *   touch it at all — it simply stays in place and the page scrolls over it.
   *   A gradient overlay on the hero section creates the fade-to-dark effect
   *   without moving the canvas.
   */
  const rawProgress = useTransform(scrollY,
    [0, typeof window !== 'undefined' ? window.innerHeight : 900],
    [0, 1]
  )
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  })
  const heroOpacity = useTransform(smoothProgress, [0, 0.75], [1, 0])
  const heroY       = useTransform(smoothProgress, [0, 1],    [0, 40])

  const [scrolled, setScrolled] = useState(false)
  useEffect(() => scrollY.on('change', y => setScrolled(y > 40)), [scrollY])

  return (
    <div className="min-h-screen overflow-x-clip bg-void-950">

      {/*
       * LIGHTFALL — position:fixed, z-index below everything.
       * Never participates in document scroll. Zero jitter by construction.
       *
       * The darkening overlay below was previously a 3-stop gradient with
       * "via-transparent" sitting at the 50% midpoint, which meant the fade
       * to solid void-950 was already well underway by the vertical center
       * of the viewport — smothering the streak effect across most of the
       * visible area, not just tapering it at the very bottom as intended.
       * Fixed by pushing the transparent zone much further down (80%) and
       * only transitioning to solid black in the final 20% of the screen.
       */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <LightfallBackground className="h-full w-full" />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, transparent 78%, #050309 100%)',
          }}
        />
      </div>

      {/* ── NAV ──────────────────────────────────────────────────────── */}
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
          <Link to="/" className="flex items-center gap-2.5">
            <motion.div whileHover={{ rotate: 15, scale: 1.05 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
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

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center py-28"
      >
        {/*
         * Content fades + rises as the user scrolls — this motion.div wraps
         * only the TEXT, not the background canvas, so scroll-driven opacity
         * never touches the compositor layer the canvas runs on.
         */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-[900px] mx-auto px-6 lg:px-12 flex flex-col items-center text-center"
        >
          {/* FSRS badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-mono text-recall-300 mb-10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-recall-400 animate-pulse-glow" />
            Powered by FSRS v4.5
          </motion.div>

          {/*
           * HEADLINE — centred, reference style.
           * Heavy weight, tight tracking, lines 1 & 3 in ghost white,
           * line 2 in the synapse→recall gradient italic — same structural
           * contrast as the reference screenshot's "Digitalizing Ideas into".
           */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-extrabold leading-[1.15] tracking-tight text-mega pb-2"
          >
            <span className="block text-ghost">Forget the</span>
            <span className="text-gradient-synapse italic">forgetting</span>
            <span className="block text-ghost">curve.</span>
          </motion.h1>

          {/* Sub-text */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="text-base sm:text-lg text-void-200 max-w-md mt-8 mb-9 leading-relaxed"
          >
            Memorix builds a live model of your memory and schedules every card
            at the exact moment you're about to lose it.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
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

          {/* Proof points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-3"
          >
            {[
              { dot: 'bg-mint-500',    text: 'Optimal review timing, always'          },
              { dot: 'bg-synapse-400', text: 'AI decks from any topic'                },
              { dot: 'bg-recall-400',  text: 'Fully offline, auto-syncs'              },
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

      {/* ── Below-fold sections sit on the solid void-950 bg ─────────── */}

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="relative bg-void-950 max-w-[1100px] mx-auto px-6 lg:px-12 py-24">
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

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 lg:px-12 overflow-hidden bg-void-950">
        <div className="absolute inset-0">
          <LightfallBackground className="h-full w-full opacity-50" />
          <div className="absolute inset-0 bg-void-950/65" />
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

      <footer className="relative bg-void-950 border-t border-white/[0.06] py-7 text-center text-xs text-void-600 font-mono">
        © {new Date().getFullYear()} Memorix — built on the FSRS open scheduling algorithm.
      </footer>
    </div>
  )
}
