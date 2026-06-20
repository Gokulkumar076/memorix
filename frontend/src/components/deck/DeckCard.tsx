import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MoreVertical, Trash2, Edit3, Play } from 'lucide-react'
import { useState } from 'react'
import type { Deck } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface DeckCardProps {
  deck: Deck
  onEdit: (deck: Deck) => void
  onDelete: (deck: Deck) => void
}

export function DeckCard({ deck, onEdit, onDelete }: DeckCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Card className="relative group" hover>
      <div className="flex items-start justify-between mb-4">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: `${deck.cover_color}22` }}
        >
          {deck.cover_emoji}
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault()
              setMenuOpen((o) => !o)
            }}
            className="p-1.5 rounded-lg text-void-400 hover:text-ghost hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-9 z-20 w-36 glass-bright rounded-xl p-1.5 shadow-glass"
            >
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setMenuOpen(false)
                  onEdit(deck)
                }}
                className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-void-200 hover:bg-white/5"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setMenuOpen(false)
                  onDelete(deck)
                }}
                className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-decay-300 hover:bg-decay-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <Link to={`/decks/${deck.id}`}>
        <h3 className="font-display text-base font-medium text-ghost mb-1.5 truncate">{deck.name}</h3>
        <p className="text-sm text-void-400 line-clamp-2 mb-4 min-h-[2.5rem]">
          {deck.description || 'No description'}
        </p>
      </Link>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant="neutral">{deck.card_count} cards</Badge>
        {deck.due_count > 0 && <Badge variant="decay">{deck.due_count} due</Badge>}
        {deck.new_count > 0 && <Badge variant="recall">{deck.new_count} new</Badge>}
        {deck.is_collaborative && <Badge variant="synapse">Shared</Badge>}
      </div>

      <Link to={`/decks/${deck.id}/study`}>
        <Button
          size="sm"
          variant={deck.due_count + deck.new_count > 0 ? 'primary' : 'secondary'}
          className="w-full"
          disabled={deck.card_count === 0}
        >
          <Play className="h-3.5 w-3.5" />
          Study now
        </Button>
      </Link>
    </Card>
  )
}
