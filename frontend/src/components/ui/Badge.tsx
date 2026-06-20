import { type HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'synapse' | 'recall' | 'decay' | 'ease' | 'neutral'
}

const badgeVariants = {
  synapse: 'bg-synapse-500/15 text-synapse-300 border-synapse-500/30',
  recall: 'bg-recall-500/15 text-recall-300 border-recall-500/30',
  decay: 'bg-decay-500/15 text-decay-300 border-decay-500/30',
  ease: 'bg-ease-500/15 text-ease-400 border-ease-500/30',
  neutral: 'bg-ink-600/40 text-ink-200 border-ink-500/30',
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  colorClass?: string
  showLabel?: boolean
}

export function ProgressBar({ value, max, className, colorClass = 'bg-synapse-500', showLabel }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={cn('space-y-1', className)}>
      <div className="h-2 w-full rounded-full bg-ink-700/60 overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-ink-400 font-mono">
          {value} / {max}
        </p>
      )}
    </div>
  )
}
