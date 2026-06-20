import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Flame, BookOpen, Target, TrendingUp, Plus, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useDecks } from '@/hooks/useDecks'
import { useAnalyticsSummary } from '@/hooks/useAnalytics'
import { StatCard } from '@/components/dashboard/StatCard'
import { ReviewHeatmap } from '@/components/dashboard/ReviewHeatmap'
import { DueDecksWidget } from '@/components/dashboard/DueDecksWidget'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Loaders'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: decks, isLoading: decksLoading } = useDecks()
  const { data: analytics, isLoading: analyticsLoading } = useAnalyticsSummary()

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const dailyGoal = user?.daily_goal ?? 20
  const todayReviews = analytics?.daily_stats.find(
    (d) => d.date === new Date().toISOString().split('T')[0]
  )?.reviews ?? 0

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="label-eyebrow mb-1.5">{greeting}</p>
        <h1 className="text-2xl sm:text-3xl font-display font-medium">
          {user?.display_name || user?.username}
        </h1>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              label="Streak"
              value={analytics?.current_streak ?? 0}
              icon={<Flame className="h-5 w-5" />}
              accent="decay"
              subtext="days in a row"
            />
            <StatCard
              label="Due today"
              value={analytics?.cards_due_today ?? 0}
              icon={<Target className="h-5 w-5" />}
              accent="synapse"
              subtext="cards waiting"
            />
            <StatCard
              label="Retention"
              value={`${analytics?.average_retention ?? 0}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              accent="recall"
              subtext="last 30 days"
            />
            <StatCard
              label="Level"
              value={analytics?.level ?? 1}
              icon={<Sparkles className="h-5 w-5" />}
              accent="ease"
              subtext={`${analytics?.total_xp ?? 0} XP`}
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Due decks */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-medium">Ready to review</h2>
              <Link to="/decks" className="text-sm text-synapse-300 hover:text-synapse-200 font-medium">
                View all decks
              </Link>
            </div>
            {decksLoading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[68px] rounded-xl" />
                ))}
              </div>
            ) : (
              <DueDecksWidget decks={decks ?? []} />
            )}
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-medium">Activity</h3>
              <p className="text-xs text-ink-500 font-mono">last 18 weeks</p>
            </div>
            {analyticsLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : (
              <ReviewHeatmap data={analytics?.heatmap_data ?? {}} />
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-display text-base font-medium mb-4">Today's goal</h3>
            <ProgressBar
              value={todayReviews}
              max={dailyGoal}
              colorClass="bg-gradient-to-r from-synapse-500 to-recall-400"
            />
            <p className="text-sm text-ink-300 mt-3">
              <span className="font-display text-lg text-ink-50">{todayReviews}</span>
              {' '}/ {dailyGoal} reviews completed
            </p>
          </Card>

          <Card>
            <h3 className="font-display text-base font-medium mb-4">Quick actions</h3>
            <div className="space-y-2.5">
              <Link to="/decks">
                <Button variant="secondary" className="w-full justify-start">
                  <Plus className="h-4 w-4" />
                  New deck
                </Button>
              </Link>
              <Link to="/decks">
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="h-4 w-4" />
                  Browse all decks
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-synapse-500/10 to-recall-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-synapse-300" />
              <h3 className="font-display text-sm font-medium">AI Card Generator</h3>
            </div>
            <p className="text-xs text-ink-400 mb-4">
              Describe any topic and generate a full deck of flashcards instantly.
            </p>
            <Link to="/decks">
              <Button size="sm" className="w-full">Try it now</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
