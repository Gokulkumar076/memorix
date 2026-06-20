import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Flame } from 'lucide-react'
import type { Deck } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function DueDecksWidget({ decks }: { decks: Deck[] }) {
  const dueDecks = decks
    .filter((d) => d.due_count > 0 || d.new_count > 0)
    .sort((a, b) => b.due_count + b.new_count - (a.due_count + a.new_count))

  if (dueDecks.length === 0) {
    return (
      <Card className="text-center py-10">
        <Flame className="h-8 w-8 text-ease-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-ink-100">All caught up</p>
        <p className="text-xs text-ink-400 mt-1">No reviews due right now. Nice work.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-2.5">
      {dueDecks.map((deck, i) => (
        <motion.div
          key={deck.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            to={`/decks/${deck.id}/study`}
            className="flex items-center gap-4 glass rounded-xl p-4 hover:border-white/[0.16] transition-all duration-200 group"
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: `${deck.cover_color}22` }}
            >
              {deck.cover_emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-50 truncate">{deck.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {deck.due_count > 0 && (
                  <Badge variant="decay">{deck.due_count} due</Badge>
                )}
                {deck.new_count > 0 && (
                  <Badge variant="recall">{deck.new_count} new</Badge>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-500 group-hover:text-synapse-300 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
