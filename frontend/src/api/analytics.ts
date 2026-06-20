import { api } from './client'
import type { AnalyticsSummary, DeckPerformance, Card, CardType } from '@/types'

export const analyticsApi = {
  summary: () => api.get<AnalyticsSummary>('/api/analytics/summary'),
  deckPerformance: () => api.get<DeckPerformance[]>('/api/analytics/deck-performance'),
}

export interface AIGenerateRequest {
  topic: string
  num_cards?: number
  card_type?: CardType
  difficulty?: string
  deck_id?: number
}

export interface AIGenerateResponse {
  cards: Card[] | Array<{ front: string; back: string; tags: string[]; card_type: CardType }>
  saved: boolean
}

export const aiApi = {
  generateCards: (data: AIGenerateRequest) =>
    api.post<AIGenerateResponse>('/api/ai/generate-cards', data),
}

export const importExportApi = {
  exportCsv: (deckId: number) =>
    api.get(`/api/import-export/export/${deckId}/csv`, { responseType: 'blob' }),
  exportJson: (deckId: number) =>
    api.get(`/api/import-export/export/${deckId}/json`),
  importCsv: (deckId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/api/import-export/import/${deckId}/csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  importAnki: (deckId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/api/import-export/import/${deckId}/anki`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
