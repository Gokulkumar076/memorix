import { useEffect, useState, useCallback, Suspense, lazy } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStudyQueue, useRatingPreview, useSubmitReview } from '@/hooks/useReviews'
import { useStudySessionStore } from '@/stores/studySessionStore'
import { Flashcard } from '@/components/review/Flashcard'
import { RatingBar } from '@/components/review/RatingBar'
import { SessionSummary } from '@/components/review/SessionSummary'
import { PageLoader } from '@/components/ui/Loaders'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import type { ReviewRating } from '@/types'

const DepthGridField = lazy(() =>
  import('@/components/webgl/DepthGridField').then((m) => ({ default: m.DepthGridField }))
)

export default function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const id = Number(deckId)
  const navigate = useNavigate()

  const { data: queueData, isLoading } = useStudyQueue(id, 20)
  const { submitOfflineAware, isOnline } = useSubmitReview()
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    queue, currentIndex, isFlipped, stats, isComplete, cardStartTime,
    startSession, flip, recordAnswer, nextCard,
  } = useStudySessionStore()

  useEffect(() => {
    if (queueData) {
      startSession(id, queueData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueData, id])

  const currentCard = queue[currentIndex]
  const { data: preview } = useRatingPreview(currentCard?.id)

  const handleFlip = useCallback(() => {
    flip()
  }, [flip])

  const handleSelectChoice = (index: number) => {
    if (isFlipped) return
    setSelectedChoice(index)
    flip()
  }

  const handleRate = async (rating: ReviewRating) => {
    if (!currentCard || submitting) return
    setSubmitting(true)
    const durationMs = Date.now() - cardStartTime

    try {
      const result = await submitOfflineAware(currentCard.id, rating, durationMs)
      recordAnswer(rating, result?.xp_earned ?? 5)
      setSelectedChoice(null)
      nextCard()
    } catch {
      toast.error('Failed to submit review — will retry when online')
      recordAnswer(rating, 0)
      setSelectedChoice(null)
      nextCard()
    } finally {
      setSubmitting(false)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isComplete || !currentCard) return
      if (currentCard.card_type === 'multiple_choice') return

      if (e.code === 'Space' && !isFlipped) {
        e.preventDefault()
        handleFlip()
      } else if (isFlipped) {
        if (e.key === '1') handleRate('again')
        if (e.key === '2') handleRate('hard')
        if (e.key === '3') handleRate('good')
        if (e.key === '4') handleRate('easy')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped, isComplete, currentCard])

  if (isLoading) return <PageLoader />

  if (isComplete) {
    return <SessionSummary stats={stats} deckId={id} />
  }

  if (!queue.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <EmptyState
          icon={<Sparkles className="h-7 w-7" />}
          title="Nothing to study right now"
          description="This deck has no cards due. Check back later or add new cards."
          action={<Button onClick={() => navigate(`/decks/${id}`)}>Back to deck</Button>}
        />
      </div>
    )
  }

  const progress = ((currentIndex) / queue.length) * 100

  return (
    <div className="relative min-h-screen flex flex-col bg-void-950 overflow-hidden">
      {/* Ambient depth — ultra-subtle, never competes with the card itself */}
      <div className="absolute inset-0 -z-0 opacity-40">
        <Suspense fallback={null}>
          <DepthGridField className="h-full w-full" />
        </Suspense>
      </div>
      <div className="absolute inset-0 -z-0 bg-void-radial" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5">
        <button
          onClick={() => navigate(`/decks/${id}`)}
          className="p-2 rounded-lg text-void-400 hover:text-ghost hover:bg-white/5"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex-1 mx-6 max-w-md">
          <div className="h-1.5 rounded-full bg-void-700/60 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-synapse-500 to-recall-400 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <span className="text-xs font-mono text-void-400">
          {currentIndex + 1} / {queue.length}
        </span>
      </div>

      {!isOnline && (
        <div className="relative z-10 mx-5 sm:mx-8 mb-2 flex items-center gap-2 rounded-lg bg-decay-500/10 border border-decay-500/20 px-3 py-2 text-xs text-decay-300 w-fit">
          <span className="h-1.5 w-1.5 rounded-full bg-decay-400 animate-pulse" />
          Studying offline — reviews will sync when reconnected
        </div>
      )}

      {/* Card area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-8 pb-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard?.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {currentCard && (
                <Flashcard
                  card={currentCard}
                  isFlipped={isFlipped}
                  onFlip={handleFlip}
                  selectedChoice={selectedChoice}
                  onSelectChoice={handleSelectChoice}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6">
            {isFlipped ? (
              <RatingBar preview={preview} onRate={handleRate} disabled={submitting} />
            ) : currentCard?.card_type !== 'multiple_choice' ? (
              <Button onClick={handleFlip} className="w-full" size="lg">
                Show answer
                <span className="text-xs font-mono opacity-60 ml-1">(space)</span>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
