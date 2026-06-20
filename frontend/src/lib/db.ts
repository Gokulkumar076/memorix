import Dexie, { type Table } from 'dexie'
import type { Card, Deck, ReviewRating } from '@/types'

export interface OfflineReview {
  id?: number
  card_id: number
  rating: ReviewRating
  duration_ms: number
  reviewed_at: string
  synced: number // 0 = pending, 1 = synced (IndexedDB indexes don't support booleans well)
}

export interface CachedCard extends Card {
  cachedAt: number
}

export interface CachedDeck extends Deck {
  cachedAt: number
}

class MemorixDB extends Dexie {
  cards!: Table<CachedCard, number>
  decks!: Table<CachedDeck, number>
  pendingReviews!: Table<OfflineReview, number>

  constructor() {
    super('MemorixDB')
    this.version(1).stores({
      cards: 'id, deck_id, due, state',
      decks: 'id, owner_id',
      pendingReviews: '++id, card_id, synced',
    })
  }
}

export const db = new MemorixDB()

// --- Cache helpers ---

export async function cacheDeck(deck: Deck) {
  await db.decks.put({ ...deck, cachedAt: Date.now() })
}

export async function cacheDecks(decks: Deck[]) {
  await db.decks.bulkPut(decks.map((d) => ({ ...d, cachedAt: Date.now() })))
}

export async function getCachedDecks(): Promise<Deck[]> {
  return db.decks.toArray()
}

export async function cacheCards(cards: Card[]) {
  await db.cards.bulkPut(cards.map((c) => ({ ...c, cachedAt: Date.now() })))
}

export async function getCachedCardsForDeck(deckId: number): Promise<Card[]> {
  return db.cards.where('deck_id').equals(deckId).toArray()
}

// --- Offline review queue ---

export async function queueOfflineReview(review: Omit<OfflineReview, 'id' | 'synced'>) {
  await db.pendingReviews.add({ ...review, synced: 0 })
}

export async function getPendingReviews(): Promise<OfflineReview[]> {
  return db.pendingReviews.where('synced').equals(0).toArray()
}

export async function markReviewsSynced(ids: number[]) {
  await db.pendingReviews.bulkDelete(ids)
}

export async function clearAllCache() {
  await db.cards.clear()
  await db.decks.clear()
  await db.pendingReviews.clear()
}
