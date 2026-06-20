export type CardType = 'basic' | 'cloze' | 'image' | 'multiple_choice'
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'
export type CardState = 'new' | 'learning' | 'review' | 'relearning'

export interface User {
  id: number
  email: string
  username: string
  display_name: string | null
  avatar_url: string | null
  daily_goal: number
  streak: number
  longest_streak: number
  total_xp: number
  level: number
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface Deck {
  id: number
  name: string
  description: string | null
  cover_color: string
  cover_emoji: string
  is_public: boolean
  is_collaborative: boolean
  owner_id: number
  tags: string[]
  card_count: number
  due_count: number
  new_count: number
  created_at: string
  updated_at: string
}

export interface ChoiceItem {
  text: string
  is_correct: boolean
}

export interface Card {
  id: number
  deck_id: number
  card_type: CardType
  front: string
  back: string | null
  cloze_text: string | null
  image_url: string | null
  choices: ChoiceItem[] | null
  tags: string[]
  notes: string | null
  stability: number
  difficulty: number
  due: string
  last_review: string | null
  reps: number
  lapses: number
  state: CardState
  is_suspended: boolean
  created_at: string
  updated_at: string
}

export interface RatingPreview {
  due: string
  scheduled_days: number
  stability: number
  difficulty: number
}

export interface RatingPreviewMap {
  again: RatingPreview
  hard: RatingPreview
  good: RatingPreview
  easy: RatingPreview
}

export interface ReviewResponse {
  card_id: number
  next_due: string
  scheduled_days: number
  stability: number
  difficulty: number
  state: CardState
  xp_earned: number
  rating: ReviewRating
}

export interface DailyStat {
  date: string
  reviews: number
  new_cards: number
  retention: number
  study_time_minutes: number
}

export interface AnalyticsSummary {
  total_reviews: number
  total_cards: number
  cards_due_today: number
  cards_new: number
  average_retention: number
  current_streak: number
  total_xp: number
  level: number
  daily_stats: DailyStat[]
  heatmap_data: Record<string, number>
}

export interface DeckPerformance {
  deck_id: number
  deck_name: string
  card_count: number
  avg_stability: number
  avg_difficulty: number
}
