import { api } from './client'
import type { Card, RatingPreviewMap, ReviewResponse, ReviewRating } from '@/types'

export interface ReviewSubmitPayload {
  card_id: number
  rating: ReviewRating
  duration_ms?: number
}

export const reviewsApi = {
  getStudyQueue: (deckId: number, limit: number = 20) =>
    api.post<Card[]>('/api/reviews/study-queue', { deck_id: deckId, limit }),
  previewRatings: (cardId: number) =>
    api.get<RatingPreviewMap>(`/api/reviews/preview/${cardId}`),
  submit: (data: ReviewSubmitPayload) =>
    api.post<ReviewResponse>('/api/reviews/submit', data),
  syncOffline: (reviews: ReviewSubmitPayload[]) =>
    api.post<{ synced: number; results: ReviewResponse[] }>('/api/reviews/sync-offline', reviews),
}
