import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Brain, Zap, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LightfallBackground } from '@/components/webgl/LightfallBackground'

const steps = [
  {
    icon: Brain,
    title: 'Your memory decays predictably',
    description:
      'Every fact you learn fades on a curve. Review too early and you waste time; too late and you\'ve already forgotten. FSRS finds the exact point in between.',
  },
  {
    icon: Zap,
    title: 'Each review reshapes the curve',
    description:
      'Rate a card Again, Hard, Good, or Easy — and the algorithm recalculates your personal stability and difficulty, stretching future intervals as your memory strengthens.',
  },
  {
    icon: Trophy,
    title: 'Consistency compounds',
    description:
      'Streaks, XP, and levels track the one variable that actually matters: showing up daily. Small, scheduled reviews beat marathon cram sessions every time.',
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const isLast = step === steps.length - 1
  const current = steps[step]

  const next = () => {
    if (isLast) {
      navigate('/dashboard')
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="relative h-64 lg:h-auto lg:w-1/2 glass !rounded-none border-r border-white/[0.06] overflow-hidden">
        <LightfallBackground className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <current.icon className="h-20 w-20 text-synapse-400/30" strokeWidth={1} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex gap-1.5 mb-10">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? 'bg-synapse-400' : 'bg-void-700'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-12 w-12 rounded-2xl bg-synapse-500/15 flex items-center justify-center text-synapse-300 mb-6">
                <current.icon className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-medium mb-4 text-balance">
                {current.title}
              </h1>
              <p className="text-void-300 leading-relaxed mb-10">{current.description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-void-500 hover:text-void-300 transition-colors"
            >
              Skip
            </button>
            <Button onClick={next}>
              {isLast ? 'Enter Memorix' : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
