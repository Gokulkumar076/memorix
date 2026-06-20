import { api } from './client'
import type { Deck } from '@/types'

export interface DeckCreatePayload {
  name: string
  description?: string
  cover_color?: string
  cover_emoji?: string
  is_public?: boolean
  tags?: string[]
}

export const decksApi = {
  list: () => api.get<Deck[]>('/api/decks'),
  get: (id: number) => api.get<Deck>(`/api/decks/${id}`),
  create: (data: DeckCreatePayload) => api.post<Deck>('/api/decks', data),
  update: (id: number, data: Partial<DeckCreatePayload>) => api.patch<Deck>(`/api/decks/${id}`, data),
  delete: (id: number) => api.delete(`/api/decks/${id}`),
  addCollaborator: (deckId: number, userId: number, role: string = 'viewer') =>
    api.post(`/api/decks/${deckId}/collaborators/${userId}?role=${role}`),
}
