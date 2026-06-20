import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import type { DailyStat } from '@/types'

export function RetentionChart({ data }: { data: DailyStat[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9461fa" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#9461fa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1b2b" vertical={false} />
        <XAxis dataKey="label" stroke="#5d5775" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#5d5775" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
        <Tooltip
          contentStyle={{
            background: 'rgba(21, 19, 31, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem',
            fontSize: '0.8rem',
          }}
          labelStyle={{ color: '#bdb8d1' }}
        />
        <Area
          type="monotone"
          dataKey="retention"
          stroke="#9461fa"
          strokeWidth={2}
          fill="url(#retentionGradient)"
          name="Retention %"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
