import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { Sparkles, Brain, Zap, BarChart3, Globe2, Layers, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const NeuralVisualization = lazy(() =>
  import('@/components/onboarding/NeuralVisualization').then((m) => ({ default: m.NeuralVisualization }))
)

const features = [
  {
    icon: Brain,
    title: 'FSRS Algorithm',
    description: 'A modern scheduling engine that models your individual memory curve — far more precise than fixed intervals.',
  },
  {
    icon: Zap,
    title: 'AI-Generated Cards',
    description: 'Turn any topic into a polished deck in seconds. Let AI draft the cards; you focus on learning.',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Retention curves, review heatmaps, and per-deck performance — see exactly how your memory evolves.',
  },
  {
    icon: Globe2,
    title: 'Offline-First',
    description: 'Study on a plane, a subway, anywhere. Reviews sync automatically the moment you reconnect.',
  },
  {
    icon: Layers,
    title: 'Rich Card Types',
    description: 'Basic, cloze deletion, image occlusion, and multiple choice — all scheduled by the same engine.',
  },
  {
    icon: Sparkles,
    title: 'Gamified Progress',
    description: 'Streaks, XP, and levels that reward consistency, not cramming.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-synapse-500 to-recall-500 flex items-center justify-center shadow-glow-synapse">
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

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-mono text-recall-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-recall-400 animate-pulse" />
            Powered by FSRS v4.5
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium leading-[1.05] text-balance mb-6">
            Remember <span className="text-gradient-synapse">everything</span>,
            <br />forget nothing.
          </h1>
          <p className="text-lg text-ink-300 max-w-lg mb-9 text-balance">
            Memorix builds a personalized model of your memory and schedules every review
            at the exact moment you're about to forget — not a day before, not a day after.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/register">
              <Button size="lg">
                Start learning free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="btn-secondary px-7 py-3.5 rounded-xl text-base">
              Sign in
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-10 text-sm text-ink-400">
            <span><strong className="text-ink-100 font-display text-base">4</strong> card types</span>
            <span><strong className="text-ink-100 font-display text-base">∞</strong> decks</span>
            <span><strong className="text-ink-100 font-display text-base">100%</strong> offline-ready</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[420px] lg:h-[520px]"
        >
          <div className="absolute inset-0 glass-card !rounded-3xl overflow-hidden">
            <Suspense
              fallback={
                <div className="h-full w-full flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-synapse-400 animate-pulse" />
                </div>
              }
            >
              <NeuralVisualization className="h-full w-full" />
            </Suspense>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="label-eyebrow mb-3">Built for serious learners</p>
          <h2 className="text-3xl sm:text-4xl font-display font-medium text-balance">
            Every feature exists to protect <br className="hidden sm:block" /> one thing: your retention.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Card hover className="h-full">
                <div className="h-10 w-10 rounded-xl bg-synapse-500/15 flex items-center justify-center text-synapse-300 mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-medium text-ink-50 mb-2">{f.title}</h3>
                <p className="text-sm text-ink-400 leading-relaxed">{f.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 lg:px-12 pb-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="glass-bright rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-mesh-synapse opacity-60" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-display font-medium mb-4 text-balance">
              Your memory, finally optimized.
            </h2>
            <p className="text-ink-300 mb-8 max-w-md mx-auto">
              Join now and let the algorithm do what your willpower can't: review exactly the right things, exactly on time.
            </p>
            <Link to="/register">
              <Button size="lg">Create your free account</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} Memorix. Built with the FSRS open scheduling algorithm.
      </footer>
    </div>
  )
}
