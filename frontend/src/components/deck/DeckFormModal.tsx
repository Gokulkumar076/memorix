import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Deck } from '@/types'
import type { DeckCreatePayload } from '@/api/decks'

const EMOJI_OPTIONS = ['📚', '🧠', '🔬', '🌍', '💻', '🎨', '🎵', '⚗️', '📐', '🏛️', '💼', '🗣️']
const COLOR_OPTIONS = ['#6366f1', '#7c3aed', '#0891b2', '#0d9488', '#ea580c', '#dc2626', '#db2777', '#16a34a']

interface DeckFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DeckCreatePayload) => void
  initialDeck?: Deck | null
  isLoading?: boolean
}

export function DeckFormModal({ isOpen, onClose, onSubmit, initialDeck, isLoading }: DeckFormModalProps) {
  const [form, setForm] = useState<DeckCreatePayload>({
    name: '',
    description: '',
    cover_color: COLOR_OPTIONS[0],
    cover_emoji: EMOJI_OPTIONS[0],
    is_public: false,
    tags: [],
  })

  useEffect(() => {
    if (initialDeck) {
      setForm({
        name: initialDeck.name,
        description: initialDeck.description || '',
        cover_color: initialDeck.cover_color,
        cover_emoji: initialDeck.cover_emoji,
        is_public: initialDeck.is_public,
        tags: initialDeck.tags,
      })
    } else {
      setForm({
        name: '',
        description: '',
        cover_color: COLOR_OPTIONS[0],
        cover_emoji: EMOJI_OPTIONS[0],
        is_public: false,
        tags: [],
      })
    }
  }, [initialDeck, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialDeck ? 'Edit deck' : 'Create a new deck'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Deck name"
          placeholder="Spanish Vocabulary"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          autoFocus
        />
        <Textarea
          label="Description"
          placeholder="What's this deck about?"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
        />

        <div>
          <p className="label-eyebrow mb-2">Icon</p>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm((f) => ({ ...f, cover_emoji: emoji }))}
                className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                  form.cover_emoji === emoji
                    ? 'bg-synapse-500/25 ring-2 ring-synapse-400'
                    : 'bg-ink-700/50 hover:bg-ink-600/60'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label-eyebrow mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((f) => ({ ...f, cover_color: color }))}
                className={`h-8 w-8 rounded-full transition-all ${
                  form.cover_color === color ? 'ring-2 ring-offset-2 ring-offset-ink-800 ring-white' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={isLoading}>
            {initialDeck ? 'Save changes' : 'Create deck'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
