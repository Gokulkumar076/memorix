import { create } from 'zustand'
import type { Card, ReviewRating } from '@/types'

interface SessionStats {
  reviewed: number
  again: number
  hard: number
  good: number
  easy: number
  xpEarned: number
  startTime: number
}

interface StudySessionState {
  deckId: number | null
  queue: Card[]
  currentIndex: number
  isFlipped: boolean
  stats: SessionStats
  cardStartTime: number
  startSession: (deckId: number, cards: Card[]) => void
  flip: () => void
  recordAnswer: (rating: ReviewRating, xp: number) => void
  nextCard: () => void
  resetSession: () => void
  isComplete: boolean
}

const initialStats: SessionStats = {
  reviewed: 0,
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
  xpEarned: 0,
  startTime: Date.now(),
}

export const useStudySessionStore = create<StudySessionState>((set, get) => ({
  deckId: null,
  queue: [],
  currentIndex: 0,
  isFlipped: false,
  stats: { ...initialStats },
  cardStartTime: Date.now(),
  isComplete: false,

  startSession: (deckId, cards) =>
    set({
      deckId,
      queue: cards,
      currentIndex: 0,
      isFlipped: false,
      stats: { ...initialStats, startTime: Date.now() },
      cardStartTime: Date.now(),
      isComplete: cards.length === 0,
    }),

  flip: () => set({ isFlipped: true }),

  recordAnswer: (rating, xp) =>
    set((state) => ({
      stats: {
        ...state.stats,
        reviewed: state.stats.reviewed + 1,
        [rating]: state.stats[rating] + 1,
        xpEarned: state.stats.xpEarned + xp,
      },
    })),

  nextCard: () => {
    const { currentIndex, queue } = get()
    const next = currentIndex + 1
    if (next >= queue.length) {
      set({ isComplete: true, isFlipped: false })
    } else {
      set({ currentIndex: next, isFlipped: false, cardStartTime: Date.now() })
    }
  },

  resetSession: () =>
    set({
      deckId: null,
      queue: [],
      currentIndex: 0,
      isFlipped: false,
      stats: { ...initialStats },
      cardStartTime: Date.now(),
      isComplete: false,
    }),
}))
