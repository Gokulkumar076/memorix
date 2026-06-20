import { type ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { KineticNumber } from '@/components/ui/KineticNumber'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  icon: ReactNode
  accent?: 'synapse' | 'recall' | 'decay' | 'mint'
  subtext?: string
}

const accentClasses = {
  synapse: 'bg-synapse-500/15 text-synapse-300',
  recall: 'bg-recall-500/15 text-recall-300',
  decay: 'bg-decay-500/15 text-decay-300',
  mint: 'bg-mint-500/15 text-mint-400',
}

const glowMap = {
  synapse: 'synapse',
  recall: 'recall',
  decay: 'decay',
  mint: 'mint',
} as const

export function StatCard({ label, value, suffix = '', icon, accent = 'synapse', subtext }: StatCardProps) {
  return (
    <Card hover glow={glowMap[accent]} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-eyebrow mb-2">{label}</p>
          <KineticNumber value={value} suffix={suffix} className="text-4xl block text-ghost" />
          {subtext && <p className="text-xs text-void-400 mt-1.5">{subtext}</p>}
        </div>
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', accentClasses[accent])}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
