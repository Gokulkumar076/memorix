import { motion } from 'framer-motion'
import { Edit3, Trash2, Pause, Play } from 'lucide-react'
import type { Card } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface CardListItemProps {
  card: Card
  onEdit: (card: Card) => void
  onDelete: (card: Card) => void
  onToggleSuspend: (card: Card) => void
}

const stateVariant: Record<string, 'synapse' | 'recall' | 'decay' | 'ease' | 'neutral'> = {
  new: 'recall',
  learning: 'decay',
  review: 'ease',
  relearning: 'decay',
}

export function CardListItem({ card, onEdit, onDelete, onToggleSuspend }: CardListItemProps) {
  const previewText = card.card_type === 'cloze' ? card.cloze_text : card.front

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'glass rounded-xl p-4 flex items-start gap-4 group',
        card.is_suspended && 'opacity-50'
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink-100 line-clamp-2 mb-2">{previewText}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={stateVariant[card.state] ?? 'neutral'}>{card.state}</Badge>
          <Badge variant="neutral">{card.card_type.replace('_', ' ')}</Badge>
          {card.lapses > 0 && <Badge variant="decay">{card.lapses} lapses</Badge>}
          {card.is_suspended && <Badge variant="neutral">Suspended</Badge>}
          {card.tags.map((tag) => (
            <span key={tag} className="text-xs text-ink-500 font-mono">#{tag}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onToggleSuspend(card)}
          className="p-2 rounded-lg text-ink-400 hover:text-ink-50 hover:bg-white/5"
          title={card.is_suspended ? 'Resume' : 'Suspend'}
        >
          {card.is_suspended ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
        <button onClick={() => onEdit(card)} className="p-2 rounded-lg text-ink-400 hover:text-ink-50 hover:bg-white/5">
          <Edit3 className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onDelete(card)} className="p-2 rounded-lg text-ink-400 hover:text-decay-300 hover:bg-decay-500/10">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
