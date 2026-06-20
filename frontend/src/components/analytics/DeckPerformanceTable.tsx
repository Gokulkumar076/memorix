import type { DeckPerformance } from '@/types'
import { ProgressBar } from '@/components/ui/Badge'

export function DeckPerformanceTable({ data }: { data: DeckPerformance[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-void-500 text-center py-8">No deck data yet</p>
  }

  return (
    <div className="space-y-4">
      {data.map((d) => (
        <div key={d.deck_id} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-void-100">{d.deck_name}</span>
            <span className="text-void-500 font-mono text-xs">{d.card_count} cards</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar
                value={d.avg_stability}
                max={Math.max(30, d.avg_stability)}
                colorClass="bg-gradient-to-r from-synapse-500 to-recall-400"
              />
            </div>
            <span className="text-xs font-mono text-void-400 w-20 text-right">
              stab. {d.avg_stability}d
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
