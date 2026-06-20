import { api } from './client'
import type { Card, CardType, ChoiceItem } from '@/types'

export interface CardCreatePayload {
  deck_id: number
  card_type: CardType
  front: string
  back?: string
  cloze_text?: string
  image_url?: string
  choices?: ChoiceItem[]
  tags?: string[]
  notes?: string
}

export type CardUpdatePayload = Partial<Omit<CardCreatePayload, 'deck_id' | 'card_type'>> & {
  is_suspended?: boolean
}

export const cardsApi = {
  listByDeck: (deckId: number) => api.get<Card[]>(`/api/cards/deck/${deckId}`),
  create: (data: CardCreatePayload) => api.post<Card>('/api/cards', data),
  bulkCreate: (deckId: number, cards: CardCreatePayload[]) =>
    api.post<Card[]>(`/api/cards/bulk?deck_id=${deckId}`, cards),
  update: (id: number, data: CardUpdatePayload) => api.patch<Card>(`/api/cards/${id}`, data),
  delete: (id: number) => api.delete(`/api/cards/${id}`),
}
