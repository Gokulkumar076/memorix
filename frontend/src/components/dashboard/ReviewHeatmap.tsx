import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { subDays, format, eachDayOfInterval } from 'date-fns'
import { cn } from '@/lib/utils'

interface HeatmapProps {
  data: Record<string, number>
  weeks?: number
}

function getIntensityClass(count: number): string {
  if (count === 0) return 'bg-void-700/40'
  if (count < 5) return 'bg-synapse-900/80'
  if (count < 15) return 'bg-synapse-700'
  if (count < 30) return 'bg-synapse-500'
  return 'bg-synapse-400'
}

export function ReviewHeatmap({ data, weeks = 18 }: HeatmapProps) {
  const days = useMemo(() => {
    const end = new Date()
    const start = subDays(end, weeks * 7 - 1)
    return eachDayOfInterval({ start, end })
  }, [weeks])

  const columns = useMemo(() => {
    const cols: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      cols.push(days.slice(i, i + 7))
    }
    return cols
  }, [days])

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-max">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const count = data[key] || 0
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: ci * 0.01 }}
                  title={`${count} review${count !== 1 ? 's' : ''} on ${format(day, 'MMM d, yyyy')}`}
                  className={cn('h-3 w-3 rounded-sm', getIntensityClass(count))}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-void-500">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 3, 10, 25, 40].map((c) => (
            <div key={c} className={cn('h-3 w-3 rounded-sm', getIntensityClass(c))} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
