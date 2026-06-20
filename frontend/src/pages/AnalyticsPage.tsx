import { motion } from 'framer-motion'
import { TrendingUp, Clock, Target, Layers } from 'lucide-react'
import { useAnalyticsSummary, useDeckPerformance } from '@/hooks/useAnalytics'
import { StatCard } from '@/components/dashboard/StatCard'
import { ReviewHeatmap } from '@/components/dashboard/ReviewHeatmap'
import { RetentionChart } from '@/components/analytics/RetentionChart'
import { ReviewVolumeChart } from '@/components/analytics/ReviewVolumeChart'
import { DeckPerformanceTable } from '@/components/analytics/DeckPerformanceTable'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Loaders'

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalyticsSummary()
  const { data: deckPerf, isLoading: deckPerfLoading } = useDeckPerformance()

  const totalStudyMinutes = analytics?.daily_stats.reduce((sum, d) => sum + d.study_time_minutes, 0) ?? 0

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="label-eyebrow mb-1.5">Insights</p>
        <h1 className="text-2xl sm:text-3xl font-display font-medium">Analytics</h1>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              label="Total reviews"
              value={analytics?.total_reviews ?? 0}
              icon={<Layers className="h-5 w-5" />}
              accent="synapse"
            />
            <StatCard
              label="Retention"
              value={analytics?.average_retention ?? 0}
              suffix="%"
              icon={<TrendingUp className="h-5 w-5" />}
              accent="recall"
              subtext="30-day average"
            />
            <StatCard
              label="Study time"
              value={Math.round(totalStudyMinutes)}
              suffix="m"
              icon={<Clock className="h-5 w-5" />}
              accent="decay"
              subtext="last 30 days"
            />
            <StatCard
              label="Cards due"
              value={analytics?.cards_due_today ?? 0}
              icon={<Target className="h-5 w-5" />}
              accent="mint"
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-display text-base font-medium mb-1">Retention over time</h3>
          <p className="text-xs text-void-500 mb-4">% of reviews rated Good or Easy, by day</p>
          {isLoading ? <Skeleton className="h-64 rounded-xl" /> : <RetentionChart data={analytics?.daily_stats ?? []} />}
        </Card>

        <Card>
          <h3 className="font-display text-base font-medium mb-1">Review volume</h3>
          <p className="text-xs text-void-500 mb-4">Cards reviewed per day, last 14 days</p>
          {isLoading ? <Skeleton className="h-64 rounded-xl" /> : <ReviewVolumeChart data={analytics?.daily_stats ?? []} />}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-display text-base font-medium mb-1">Activity heatmap</h3>
          <p className="text-xs text-void-500 mb-4">Last 18 weeks of review activity</p>
          {isLoading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : (
            <ReviewHeatmap data={analytics?.heatmap_data ?? {}} />
          )}
        </Card>

        <Card>
          <h3 className="font-display text-base font-medium mb-1">Deck performance</h3>
          <p className="text-xs text-void-500 mb-4">Average memory stability per deck</p>
          {deckPerfLoading ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : (
            <DeckPerformanceTable data={deckPerf ?? []} />
          )}
        </Card>
      </div>
    </div>
  )
}
