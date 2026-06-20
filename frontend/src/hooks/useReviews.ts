import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { reviewsApi, type ReviewSubmitPayload } from '@/api/reviews'
import { cacheCards, getCachedCardsForDeck, queueOfflineReview } from '@/lib/db'
import { useOnlineStatus } from './useOfflineSync'
import type { ReviewRating, ReviewResponse } from '@/types'

export function useStudyQueue(deckId: number | undefined, limit: number = 20) {
  const isOnline = useOnlineStatus()

  return useQuery({
    queryKey: ['studyQueue', deckId, limit],
    queryFn: async () => {
      if (!isOnline) {
        const cached = await getCachedCardsForDeck(deckId!)
        const now = new Date()
        return cached
          .filter((c) => !c.is_suspended && (c.state === 'new' || new Date(c.due) <= now))
          .slice(0, limit)
      }
      const { data } = await reviewsApi.getStudyQueue(deckId!, limit)
      await cacheCards(data)
      return data
    },
    enabled: !!deckId,
    staleTime: 0,
  })
}

export function useRatingPreview(cardId: number | undefined) {
  return useQuery({
    queryKey: ['ratingPreview', cardId],
    queryFn: async () => {
      const { data } = await reviewsApi.previewRatings(cardId!)
      return data
    },
    enabled: !!cardId,
    staleTime: 60 * 1000,
  })
}

export function useSubmitReview() {
  const isOnline = useOnlineStatus()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: ReviewSubmitPayload): Promise<ReviewResponse | null> => {
      if (!isOnline) {
        await queueOfflineReview({
          card_id: payload.card_id,
          rating: payload.rating,
          duration_ms: payload.duration_ms || 0,
          reviewed_at: new Date().toISOString(),
        })
        return null
      }
      const { data } = await reviewsApi.submit(payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })

  const submitOfflineAware = useCallback(
    async (cardId: number, rating: ReviewRating, durationMs?: number) => {
      return mutation.mutateAsync({ card_id: cardId, rating, duration_ms: durationMs })
    },
    [mutation]
  )

  return { ...mutation, submitOfflineAware, isOnline }
}
