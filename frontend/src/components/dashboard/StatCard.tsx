import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  accent?: 'synapse' | 'recall' | 'decay' | 'ease'
  subtext?: string
}

const accentClasses = {
  synapse: 'bg-synapse-500/15 text-synapse-300',
  recall: 'bg-recall-500/15 text-recall-300',
  decay: 'bg-decay-500/15 text-decay-300',
  ease: 'bg-ease-500/15 text-ease-400',
}

export function StatCard({ label, value, icon, accent = 'synapse', subtext }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-eyebrow mb-2">{label}</p>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-medium text-ink-50"
          >
            {value}
          </motion.p>
          {subtext && <p className="text-xs text-ink-400 mt-1.5">{subtext}</p>}
        </div>
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', accentClasses[accent])}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
