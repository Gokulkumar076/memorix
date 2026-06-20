import { motion } from 'framer-motion'
import type { Card } from '@/types'

interface FlashcardProps {
  card: Card
  isFlipped: boolean
  onFlip: () => void
  selectedChoice: number | null
  onSelectChoice: (index: number) => void
}

function renderCloze(text: string, revealed: boolean): React.ReactNode {
  const parts = text.split(/(\{\{c\d+::.*?\}\})/g)
  return parts.map((part, i) => {
    const match = part.match(/\{\{c\d+::(.*?)\}\}/)
    if (match) {
      return revealed ? (
        <span key={i} className="text-synapse-300 font-semibold">{match[1]}</span>
      ) : (
        <span key={i} className="inline-block rounded bg-synapse-500/25 px-2 text-transparent select-none">
          {match[1]}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function Flashcard({ card, isFlipped, onFlip, selectedChoice, onSelectChoice }: FlashcardProps) {
  if (card.card_type === 'multiple_choice') {
    return (
      <div className="glass-card p-8 sm:p-10 min-h-[340px] flex flex-col">
        <p className="label-eyebrow mb-6">Choose the correct answer</p>
        <p className="text-xl sm:text-2xl font-display text-ink-50 mb-8 text-balance">{card.front}</p>
        <div className="space-y-2.5 flex-1">
          {card.choices?.map((choice, i) => {
            const isSelected = selectedChoice === i
            const showResult = isFlipped
            const isCorrect = choice.is_correct
            return (
              <button
                key={i}
                disabled={isFlipped}
                onClick={() => onSelectChoice(i)}
                className={`w-full text-left rounded-xl px-4 py-3.5 text-sm font-medium transition-all border ${
                  showResult
                    ? isCorrect
                      ? 'bg-ease-500/15 border-ease-500/40 text-ease-300'
                      : isSelected
                        ? 'bg-decay-500/15 border-decay-500/40 text-decay-300'
                        : 'bg-ink-700/30 border-white/[0.06] text-ink-400'
                    : isSelected
                      ? 'bg-synapse-500/15 border-synapse-400/40 text-synapse-200'
                      : 'bg-ink-700/40 border-white/[0.06] text-ink-200 hover:bg-ink-600/50'
                }`}
              >
                {choice.text}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="[perspective:1200px]">
      <motion.div
        className="relative w-full min-h-[340px] [transform-style:preserve-3d] cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 24 }}
        onClick={!isFlipped ? onFlip : undefined}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] glass-card p-8 sm:p-10 flex flex-col items-center justify-center text-center">
          <p className="label-eyebrow mb-6">
            {card.card_type === 'cloze' ? 'Fill in the blank' : 'Question'}
          </p>
          {card.card_type === 'image' && card.image_url && (
            <img src={card.image_url} alt="" className="max-h-48 rounded-xl mb-6 object-contain" />
          )}
          <p className="text-xl sm:text-2xl font-display text-ink-50 text-balance leading-relaxed">
            {card.card_type === 'cloze' ? renderCloze(card.cloze_text || '', false) : card.front}
          </p>
          <p className="text-xs text-ink-500 mt-8 font-mono">tap to reveal answer</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] glass-card p-8 sm:p-10 flex flex-col items-center justify-center text-center bg-gradient-to-br from-synapse-500/[0.06] to-recall-500/[0.06]">
          <p className="label-eyebrow mb-6">Answer</p>
          <p className="text-xl sm:text-2xl font-display text-ink-50 text-balance leading-relaxed">
            {card.card_type === 'cloze' ? renderCloze(card.cloze_text || '', true) : card.back}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
