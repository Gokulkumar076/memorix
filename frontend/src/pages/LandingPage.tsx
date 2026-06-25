import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import {
  Sparkles, Brain, Zap, BarChart3, Globe2, Layers,
  ArrowRight, Activity, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Magnetic } from '@/components/ui/Magnetic'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { KineticNumber } from '@/components/ui/KineticNumber'
import { LightfallBackground } from '@/components/webgl/LightfallBackground'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Feature data                                                          */
/* ------------------------------------------------------------------ */
const features = [
  { icon: Brain,    title: 'FSRS scheduling',    glow: 'synapse' as const, description: 'A live model of your memory — every review recalculates exactly when you\'ll next forget.' },
  { icon: Zap,      title: 'AI-generated decks',  glow: 'recall'  as const, description: 'Name a topic. Get a full deck of structured flashcards in seconds, not hours.' },
  { icon: BarChart3, title: 'Deep analytics',     glow: 'mint'    as const, description: 'Retention curves, heatmaps, per-deck stability — see your memory as data.' },
  { icon: Globe2,   title: 'Offline-first',        glow: 'decay'   as const, description: 'Study with zero signal. Reviews queue locally and sync the moment you reconnect.' },
  { icon: Layers,   title: 'Four card formats',   glow: 'synapse' as const, description: 'Basic, cloze, image, multiple choice — one scheduling engine drives all of them.' },
  { icon: Sparkles, title: 'Built to compound',   glow: 'recall'  as const, description: 'XP, streaks, levels — engineered to reward daily consistency, not cramming.' },
]

/* ------------------------------------------------------------------ */
/* Animated FSRS interval meter — replaces generic "Memory Science"    */
/* Shows a live decaying retention bar + rating buttons with intervals  */
/* ------------------------------------------------------------------ */
const DEMO_CARDS = [
  { q: 'What does FSRS stand for?',       a: 'Free Spaced Repetition Scheduler',                       stability: 4  },
  { q: 'What is the forgetting curve?',   a: 'The rate at which memory fades over time without review', stability: 9  },
  { q: 'What is "stability" in FSRS?',    a: 'Days until your recall drops below 90%',                 stability: 18 },
]

const RATINGS = [
  { label: 'Again', interval: '10m', cls: 'text-decay-300 border-decay-400/40 bg-decay-500/10 hover:bg-decay-500/25' },
  { label: 'Hard',  interval: '1d',  cls: 'text-amber-300 border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/25' },
  { label: 'Good',  interval: '4d',  cls: 'text-synapse-300 border-synapse-400/40 bg-synapse-500/10 hover:bg-synapse-500/25' },
  { label: 'Easy',  interval: '14d', cls: 'text-mint-400 border-mint-500/40 bg-mint-500/10 hover:bg-mint-500/25' },
]

function RetentionBar({ stability }: { stability: number }) {
  // Simulates the forgetting curve draining over 8 seconds then resetting
  const [pct, setPct] = useState(98)
  useEffect(() => {
    let t = 0
    const interval = setInterval(() => {
      t += 0.12
      // FSRS-style decay: (1 + t/(9*stability))^(-1)
      const retention = Math.max(0, Math.round(100 / (1 + t / (9 * stability))))
      setPct(retention)
      if (retention <= 60) { clearInterval(interval); setTimeout(() => setPct(98), 800) }
    }, 120)
    return () => clearInterval(interval)
  }, [stability])

  const color = pct > 85 ? '#0aefa0' : pct > 70 ? '#8b5cf6' : '#fb7037'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-void-400 uppercase tracking-wider">Retention</span>
        <motion.span
          key={pct}
          initial={{ opacity: 0.5, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[11px] font-mono font-bold"
          style={{ color }}
        >
          {pct}%
        </motion.span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-void-700 overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%`, backgroundColor: color }}
          transition={{ duration: 0.15 }}
          className="h-full rounded-full"
        />
      </div>
    </div>
  )
}

function LiveFlashcard() {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [rated, setRated] = useState<string | null>(null)
  const card = DEMO_CARDS[idx]

  const rate = (_label: string, interval: string) => {
    setRated(interval)
    setTimeout(() => {
      setRated(null)
      setFlipped(false)
      setIdx(i => (i + 1) % DEMO_CARDS.length)
    }, 900)
  }

  return (
    <div className="relative w-full max-w-[340px] mx-auto select-none">
      {/* Depth stack */}
      <div className="absolute inset-x-5 -bottom-2.5 h-full rounded-2xl bg-void-700/25 border border-white/[0.04]" />
      <div className="absolute inset-x-2.5 -bottom-1 h-full rounded-2xl bg-void-700/40 border border-white/[0.06]" />

      {/* Main card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative glass-bright rounded-2xl overflow-hidden"
        >
          {/* Header strip with live retention meter */}
          <div className="px-4 pt-4 pb-3 border-b border-white/[0.07] space-y-2.5">
            <RetentionBar stability={card.stability} />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-void-500 uppercase tracking-wider">
                Stability: {card.stability}d
              </span>
              <div className="flex gap-1">
                {DEMO_CARDS.map((_, i) => (
                  <div key={i} className={cn('h-1.5 w-1.5 rounded-full transition-colors duration-300', i === idx ? 'bg-synapse-400' : 'bg-void-600')} />
                ))}
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="px-4 py-5 min-h-[130px] flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider mb-2.5">
                {flipped ? 'Answer' : 'Question'}
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={flipped ? 'a' : 'q'}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    'font-display font-bold text-base leading-snug',
                    flipped ? 'text-recall-300' : 'text-ghost'
                  )}
                >
                  {flipped ? card.a : card.q}
                </motion.p>
              </AnimatePresence>
            </div>
            {!flipped && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setFlipped(true)}
                className="mt-4 w-full rounded-xl bg-void-700/50 border border-white/[0.07] py-2 text-xs font-medium text-void-300 hover:text-ghost hover:bg-void-600/60 transition-all"
              >
                Tap to reveal
              </motion.button>
            )}
          </div>

          {/* Rating row */}
          <AnimatePresence>
            {flipped && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 pb-4 grid grid-cols-4 gap-1.5"
              >
                {RATINGS.map(r => (
                  <motion.button
                    key={r.label}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => rate(r.label, r.interval)}
                    className={cn('rounded-xl border py-2 transition-all', r.cls)}
                  >
                    <div className="text-[11px] font-bold">{r.label}</div>
                    <div className="text-[9px] font-mono opacity-60 mt-0.5">{r.interval}</div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flash overlay when rated */}
          <AnimatePresence>
            {rated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center bg-void-900/85 backdrop-blur-sm rounded-2xl"
              >
                <motion.div
                  initial={{ scale: 0.75, y: 6 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 300 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-mint-400" />
                  <span className="font-display font-bold text-sm text-ghost">See you in {rated}</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-[10px] font-mono text-void-600 uppercase tracking-wider mt-4">
        interactive demo — try it
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const { scrollY } = useScroll()
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => scrollY.on('change', y => setScrolled(y > 40)), [scrollY])

  return (
    <div className="min-h-screen overflow-x-clip bg-void-950">

      {/* ── NAV ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 inset-x-0 z-30 flex justify-center px-4"
      >
        <motion.div
          animate={{ paddingLeft: scrolled ? 14 : 20, paddingRight: scrolled ? 10 : 16 }}
          className={cn(
            'flex items-center gap-5 rounded-full py-2 transition-colors duration-500',
            scrolled ? 'glass-bright shadow-glow-synapse/15' : 'bg-transparent'
          )}
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-7 w-7 rounded-lg bg-synapse-500 flex items-center justify-center shadow-glow-synapse">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-mint-500 animate-pulse-glow" />
            </div>
            <span className="font-display font-bold text-base tracking-tight hidden sm:inline">Memorix</span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-void-300 border-l border-white/10 pl-5">
            <Activity className="h-3 w-3 text-mint-500" />
            <span>engine live</span>
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-5">
            <Link to="/login" className="btn-ghost !px-3 !py-1.5 text-sm">Sign in</Link>
            <Magnetic strength={0.2}>
              <Link to="/register"><Button size="sm">Get started</Button></Link>
            </Magnetic>
          </div>
        </motion.div>
      </motion.nav>

      {/* ── HERO — full viewport, all content visible without scrolling ── */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[640px] max-h-[1000px] flex items-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 -z-0">
          <LightfallBackground className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-void-950/40 via-transparent to-void-950" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-16
                     grid lg:grid-cols-[1fr_380px] gap-10 xl:gap-16 items-center"
        >
          {/* LEFT */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 self-start rounded-full glass px-3 py-1.5 text-xs font-mono text-recall-300 mb-5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-recall-400 animate-pulse-glow" />
              Powered by FSRS v4.5
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="text-mega font-display font-extrabold leading-none mb-5"
            >
              Forget the<br />
              <span className="text-gradient-synapse">forgetting</span><br />
              curve.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-base sm:text-lg text-void-200 max-w-md mb-7 leading-relaxed"
            >
              Memorix builds a live model of your memory and schedules every card
              at the exact moment you're about to lose it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48 }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <Magnetic>
                <Link to="/register">
                  <Button size="lg">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </Magnetic>
              <Link to="/login" className="btn-secondary !px-6 !py-3 !rounded-xl text-sm">
                Sign in
              </Link>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-7"
            >
              {[
                { num: 4,   suffix: '',   label: 'card types'      },
                { num: 90,  suffix: '%',  label: 'target retention'},
                { num: 100, suffix: '%',  label: 'offline-ready'   },
              ].map((s, i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="flex items-baseline gap-0.5">
                    <KineticNumber
                      value={s.num}
                      className="text-2xl font-display font-extrabold text-ghost"
                    />
                    <span className="text-xl font-display font-extrabold text-synapse-400">{s.suffix}+</span>
                  </div>
                  <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — flashcard demo, hidden on small screens */}
          <motion.div
            initial={{ opacity: 0, x: 28, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex items-center justify-center"
          >
            <LiveFlashcard />
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-void-500">
          <span className="text-[9px] font-mono uppercase tracking-[0.3em]">scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-6 w-px bg-gradient-to-b from-void-400 to-transparent"
          />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
        <Reveal className="mb-14 max-w-2xl">
          <p className="label-eyebrow mb-3">How it works</p>
          <h2 className="text-huge font-display font-extrabold">
            Every feature exists to<br />
            <span className="text-gradient-synapse">protect your retention.</span>
          </h2>
        </Reveal>

        <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.07}>
          {features.map(f => (
            <RevealItem key={f.title}>
              <Card hover glow={f.glow} className="h-full group cursor-default">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="h-11 w-11 rounded-xl bg-synapse-500/12 flex items-center justify-center text-synapse-300 mb-4"
                >
                  <f.icon className="h-5 w-5" />
                </motion.div>
                <h3 className="font-display font-bold text-lg text-ghost mb-2">{f.title}</h3>
                <p className="text-sm text-void-300 leading-relaxed">{f.description}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-28 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0">
          <LightfallBackground className="h-full w-full opacity-70" />
          <div className="absolute inset-0 bg-void-950/55" />
        </div>
        <Reveal className="relative max-w-[1400px] mx-auto text-center">
          <h2 className="text-huge font-display font-extrabold mb-4">
            Your memory,<br />
            <span className="text-gradient-synapse">finally</span> optimized.
          </h2>
          <p className="text-void-300 mb-10 max-w-sm mx-auto">
            Join now and start building decks that actually stick.
          </p>
          <Magnetic>
            <Link to="/register" className="inline-block">
              <Button size="xl">
                Create your free account <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </Magnetic>
        </Reveal>
      </section>

      <footer className="border-t border-white/[0.06] py-7 text-center text-xs text-void-600 font-mono">
        © {new Date().getFullYear()} Memorix — built on the FSRS open scheduling algorithm.
      </footer>
    </div>
  )
}
