import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Sparkles, Brain, Zap, BarChart3, Globe2, Layers, ArrowRight, Activity, CheckCircle2, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Magnetic } from '@/components/ui/Magnetic'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { KineticNumber } from '@/components/ui/KineticNumber'
import { AuroraField } from '@/components/webgl/AuroraField'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Brain,
    title: 'FSRS scheduling',
    description: 'A live model of your memory — every review recalculates exactly when you\'ll next forget.',
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
    title: 'Deep analytics',
    description: 'Retention curves, heatmaps, per-deck stability — see your memory as data.',
    glow: 'mint' as const,
  },
  {
    icon: Globe2,
    title: 'Offline-first',
    description: 'Study with zero signal. Reviews queue locally and sync the moment you reconnect.',
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
    description: 'XP, streaks, levels — engineered to reward daily consistency, not cramming.',
    glow: 'recall' as const,
  },
]

/* ---------- Interactive flashcard demo for the hero ---------- */
const DEMO_CARDS = [
  { q: 'What does FSRS stand for?', a: 'Free Spaced Repetition Scheduler', tag: 'Memory Science' },
  { q: 'What is the forgetting curve?', a: 'The rate at which memory fades over time without review', tag: 'Psychology' },
  { q: 'What is "stability" in FSRS?', a: 'Days until your recall drops below 90%', tag: 'Algorithm' },
]

const RATING_COLORS: Record<string, string> = {
  Again: 'text-decay-300 border-decay-400/40 bg-decay-500/10 hover:bg-decay-500/20',
  Hard: 'text-amber-300 border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20',
  Good: 'text-synapse-300 border-synapse-400/40 bg-synapse-500/10 hover:bg-synapse-500/20',
  Easy: 'text-mint-400 border-mint-500/40 bg-mint-500/10 hover:bg-mint-500/20',
}

const RATING_INTERVALS: Record<string, string> = {
  Again: '10m',
  Hard: '1d',
  Good: '4d',
  Easy: '14d',
}

function LiveFlashcard() {
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [lastRating, setLastRating] = useState<string | null>(null)
  const card = DEMO_CARDS[cardIndex]

  const rate = (r: string) => {
    setLastRating(r)
    setTimeout(() => {
      setFlipped(false)
      setLastRating(null)
      setCardIndex((i) => (i + 1) % DEMO_CARDS.length)
    }, 700)
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Stack depth illusion */}
      <div className="absolute inset-x-4 -bottom-3 h-full rounded-2xl bg-void-700/30 border border-white/[0.05]" />
      <div className="absolute inset-x-2 -bottom-1.5 h-full rounded-2xl bg-void-700/50 border border-white/[0.07]" />

      {/* Main card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cardIndex}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative glass-bright rounded-2xl overflow-hidden"
        >
          {/* Top strip */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07]">
            <span className="text-[10px] font-mono text-void-400 uppercase tracking-wider">{card.tag}</span>
            <div className="flex items-center gap-1.5">
              {DEMO_CARDS.map((_, i) => (
                <div key={i} className={cn('h-1.5 w-1.5 rounded-full transition-colors', i === cardIndex ? 'bg-synapse-400' : 'bg-void-600')} />
              ))}
            </div>
          </div>

          {/* Card body */}
          <div className="px-5 py-6 min-h-[160px] flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-mono text-void-400 uppercase tracking-wider mb-3">
                {flipped ? 'Answer' : 'Question'}
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={flipped ? 'answer' : 'question'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'font-display font-semibold text-lg leading-snug',
                    flipped ? 'text-recall-300' : 'text-ghost'
                  )}
                >
                  {flipped ? card.a : card.q}
                </motion.p>
              </AnimatePresence>
            </div>

            {!flipped && (
              <button
                onClick={() => setFlipped(true)}
                className="mt-5 w-full rounded-xl bg-void-700/60 border border-white/[0.08] py-2 text-xs font-medium text-void-300 hover:text-ghost hover:bg-void-600/60 transition-all"
              >
                Tap to reveal
              </button>
            )}
          </div>

          {/* Rating row */}
          <AnimatePresence>
            {flipped && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-5 pb-5 grid grid-cols-4 gap-2"
              >
                {Object.entries(RATING_COLORS).map(([label, cls]) => (
                  <motion.button
                    key={label}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => rate(label)}
                    className={cn('rounded-xl border py-2 text-[11px] font-semibold transition-all', cls)}
                  >
                    <div>{label}</div>
                    <div className="text-[9px] opacity-60 font-mono">{RATING_INTERVALS[label]}</div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rating flash overlay */}
          <AnimatePresence>
            {lastRating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-void-900/80 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5 text-mint-400" />
                  <span className="font-display font-bold text-ghost">See you in {RATING_INTERVALS[lastRating]}</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Auto-demo label */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        <RefreshCcw className="h-3 w-3 text-void-500 animate-spin-slow" />
        <span className="text-[10px] font-mono text-void-500 uppercase tracking-wider">live demo</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ */

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    return scrollY.on('change', (y) => setScrolled(y > 40))
  }, [scrollY])

  return (
    <div className="min-h-screen overflow-x-clip bg-void-950">

      {/* NAV */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 inset-x-0 z-30 flex justify-center px-4"
      >
        <motion.div
          animate={{ paddingLeft: scrolled ? 14 : 20, paddingRight: scrolled ? 10 : 16 }}
          className={cn(
            'flex items-center gap-6 rounded-full py-2 transition-colors duration-500',
            scrolled ? 'glass-bright shadow-glow-synapse/20' : 'bg-transparent'
          )}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative h-7 w-7 rounded-lg bg-synapse-500 flex items-center justify-center shadow-glow-synapse">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-mint-500 animate-pulse-glow" />
            </div>
            <span className="font-display font-bold text-base tracking-tight hidden sm:inline">Memorix</span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 pl-2 text-[11px] font-mono text-void-300 border-l border-white/10">
            <Activity className="h-3 w-3 text-mint-500" />
            <span>engine live</span>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <Link to="/login" className="btn-ghost !px-3.5 !py-1.5 text-sm">Sign in</Link>
            <Magnetic strength={0.25}>
              <Link to="/register"><Button size="sm">Get started</Button></Link>
            </Magnetic>
          </div>
        </motion.div>
      </motion.nav>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 -z-0">
          <AuroraField className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-void-950/30 via-transparent to-void-950" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* LEFT — text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-mono text-recall-300 mb-8"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-recall-400 animate-pulse-glow" />
              Powered by FSRS v4.5
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-mega font-display font-extrabold leading-none"
            >
              Forget the<br />
              <span className="text-gradient-synapse">forgetting</span><br />
              curve.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="text-lg text-void-200 max-w-lg mt-7 mb-10 leading-relaxed"
            >
              Memorix builds a live model of your memory and schedules every
              card at the exact moment you're about to lose it — never a day earlier.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Magnetic>
                <Link to="/register">
                  <Button size="lg">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </Magnetic>
              <Link to="/login" className="btn-secondary px-6 py-3 rounded-xl text-sm">
                Sign in
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-6 mt-10"
            >
              {[
                { num: 4, label: 'card types' },
                { num: 90, label: '% target retention' },
                { num: 100, label: '% offline-ready' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <KineticNumber value={s.num} suffix="+" className="text-2xl font-display font-bold text-ghost block" />
                  <span className="text-[10px] font-mono text-void-400 uppercase tracking-wider">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — interactive flashcard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <LiveFlashcard />
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-void-500">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em]">scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="h-8 w-px bg-gradient-to-b from-void-400 to-transparent"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-28">
        <Reveal className="mb-16 max-w-2xl">
          <p className="label-eyebrow mb-4">How it works</p>
          <h2 className="text-huge font-display font-extrabold">
            Every feature exists to protect <span className="text-gradient-synapse">one thing</span>.
          </h2>
        </Reveal>

        <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.08}>
          {features.map((f) => (
            <RevealItem key={f.title}>
              <Card hover glow={f.glow} className="h-full group">
                <div className="h-12 w-12 rounded-xl bg-synapse-500/15 flex items-center justify-center text-synapse-300 mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-ghost mb-2.5">{f.title}</h3>
                <p className="text-sm text-void-300 leading-relaxed">{f.description}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* CTA */}
      <section className="relative px-6 lg:px-12 py-32 overflow-hidden">
        <div className="absolute inset-0">
          <AuroraField className="h-full w-full opacity-60" />
          <div className="absolute inset-0 bg-void-950/50" />
        </div>
        <Reveal className="relative max-w-[1400px] mx-auto text-center">
          <h2 className="text-mega font-display font-extrabold mb-10">
            Your memory,<br />
            <span className="text-gradient-synapse">finally</span> optimized.
          </h2>
          <Magnetic>
            <Link to="/register" className="inline-block">
              <Button size="xl">
                Create your free account <ArrowRight className="h-5 w-5" />
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
