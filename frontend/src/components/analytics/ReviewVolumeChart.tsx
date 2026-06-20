import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import type { DailyStat } from '@/types'

export function ReviewVolumeChart({ data }: { data: DailyStat[] }) {
  const chartData = data.slice(-14).map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1b2b" vertical={false} />
        <XAxis dataKey="label" stroke="#5d5775" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#5d5775" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'rgba(21, 19, 31, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem',
            fontSize: '0.8rem',
          }}
          labelStyle={{ color: '#bdb8d1' }}
        />
        <Bar dataKey="reviews" fill="#22d3ee" radius={[6, 6, 0, 0]} name="Reviews" />
      </BarChart>
    </ResponsiveContainer>
  )
}
