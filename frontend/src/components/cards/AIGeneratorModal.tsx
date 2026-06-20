import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { aiApi } from '@/api/analytics'
import { getApiErrorMessage } from '@/api/client'
import { useQueryClient } from '@tanstack/react-query'

interface AIGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  deckId?: number
  onDeckCreated?: () => void
}

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'] as const

export function AIGeneratorModal({ isOpen, onClose, deckId, onDeckCreated }: AIGeneratorModalProps) {
  const [topic, setTopic] = useState('')
  const [numCards, setNumCards] = useState(10)
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTY_OPTIONS[number]>('intermediate')
  const [isGenerating, setIsGenerating] = useState(false)
  const queryClient = useQueryClient()

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }
    setIsGenerating(true)
    try {
      const { data } = await aiApi.generateCards({
        topic,
        num_cards: numCards,
        difficulty,
        deck_id: deckId,
      })

      if (data.saved) {
        toast.success(`Generated ${data.cards.length} cards`)
        queryClient.invalidateQueries({ queryKey: ['cards', deckId] })
        queryClient.invalidateQueries({ queryKey: ['decks'] })
        onDeckCreated?.()
        onClose()
        setTopic('')
      } else {
        toast.success(`Generated ${data.cards.length} cards — create or select a deck to save them`)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate cards with AI">
      <div className="space-y-5">
        <div className="flex items-center gap-2 rounded-xl bg-synapse-500/10 border border-synapse-500/20 px-4 py-3 text-xs text-synapse-300">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          Describe a topic and AI will draft well-structured flashcards for you to review and save.
        </div>

        <Input
          label="Topic"
          placeholder="e.g. The French Revolution, JavaScript closures, Organic chemistry nomenclature"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Number of cards"
            type="number"
            min={1}
            max={30}
            value={numCards}
            onChange={(e) => setNumCards(Number(e.target.value))}
          />
          <div className="space-y-1.5">
            <p className="label-eyebrow">Difficulty</p>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              className="input-field"
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleGenerate} className="flex-1" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
