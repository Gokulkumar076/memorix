import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trophy, Sparkles, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SessionSummaryProps {
  stats: {
    reviewed: number
    again: number
    hard: number
    good: number
    easy: number
    xpEarned: number
    startTime: number
  }
  deckId: number
}

export function SessionSummary({ stats, deckId }: SessionSummaryProps) {
  const navigate = useNavigate()
  const durationMin = Math.max(1, Math.round((Date.now() - stats.startTime) / 60000))
  const accuracy = stats.reviewed > 0 ? Math.round(((stats.good + stats.easy) / stats.reviewed) * 100) : 0

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22 }}
        className="w-full max-w-md glass-card p-8 sm:p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="h-16 w-16 rounded-2xl bg-gradient-to-br from-synapse-500 to-recall-500 flex items-center justify-center mx-auto mb-6 shadow-glow-synapse"
        >
          <Trophy className="h-8 w-8 text-white" />
        </motion.div>

        <h1 className="text-2xl font-display font-medium mb-1.5">Session complete</h1>
        <p className="text-sm text-void-400 mb-8">
          {stats.reviewed} cards reviewed in {durationMin} minute{durationMin !== 1 ? 's' : ''}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="glass rounded-xl p-4">
            <p className="text-2xl font-display text-ghost">{accuracy}%</p>
            <p className="text-xs text-void-500 mt-1">accuracy</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-2xl font-display text-synapse-300 flex items-center justify-center gap-1">
              <Sparkles className="h-4 w-4" />{stats.xpEarned}
            </p>
            <p className="text-xs text-void-500 mt-1">XP earned</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-2xl font-display text-ghost">{stats.reviewed}</p>
            <p className="text-xs text-void-500 mt-1">reviewed</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8 text-xs">
          <span className="flex items-center gap-1.5 text-decay-300"><span className="h-2 w-2 rounded-full bg-decay-400" />{stats.again} again</span>
          <span className="flex items-center gap-1.5 text-amber-300"><span className="h-2 w-2 rounded-full bg-amber-400" />{stats.hard} hard</span>
          <span className="flex items-center gap-1.5 text-synapse-300"><span className="h-2 w-2 rounded-full bg-synapse-400" />{stats.good} good</span>
          <span className="flex items-center gap-1.5 text-mint-400"><span className="h-2 w-2 rounded-full bg-mint-400" />{stats.easy} easy</span>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(`/decks/${deckId}`)} className="flex-1">
            Back to deck
          </Button>
          <Button onClick={() => window.location.reload()} className="flex-1">
            <RotateCcw className="h-4 w-4" />
            Study more
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
