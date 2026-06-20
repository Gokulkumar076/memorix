import { motion } from 'framer-motion'
import type { RatingPreviewMap, ReviewRating } from '@/types'

interface RatingBarProps {
  preview: RatingPreviewMap | undefined
  onRate: (rating: ReviewRating) => void
  disabled?: boolean
}

const RATING_CONFIG: { rating: ReviewRating; label: string; classes: string; key: string }[] = [
  { rating: 'again', label: 'Again', classes: 'bg-decay-500/15 text-decay-300 hover:bg-decay-500/25 border-decay-500/30', key: '1' },
  { rating: 'hard', label: 'Hard', classes: 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/25', key: '2' },
  { rating: 'good', label: 'Good', classes: 'bg-synapse-500/15 text-synapse-300 hover:bg-synapse-500/25 border-synapse-500/30', key: '3' },
  { rating: 'easy', label: 'Easy', classes: 'bg-mint-500/15 text-mint-400 hover:bg-mint-500/25 border-mint-500/30', key: '4' },
]

function formatInterval(days: number): string {
  if (days < 1) return '<1d'
  if (days === 1) return '1d'
  if (days < 30) return `${days}d`
  if (days < 365) return `${Math.round(days / 30)}mo`
  return `${(days / 365).toFixed(1)}y`
}

export function RatingBar({ preview, onRate, disabled }: RatingBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-4 gap-2.5"
    >
      {RATING_CONFIG.map((cfg) => (
        <button
          key={cfg.rating}
          disabled={disabled}
          onClick={() => onRate(cfg.rating)}
          className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3.5 transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none ${cfg.classes}`}
        >
          <span className="text-sm font-semibold">{cfg.label}</span>
          <span className="text-xs font-mono opacity-70">
            {preview ? formatInterval(preview[cfg.rating].scheduled_days) : '—'}
          </span>
        </button>
      ))}
    </motion.div>
  )
}
