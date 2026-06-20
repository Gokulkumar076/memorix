import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Card, CardType, ChoiceItem } from '@/types'
import type { CardCreatePayload } from '@/api/cards'

interface CardFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<CardCreatePayload, 'deck_id'>) => void
  initialCard?: Card | null
  isLoading?: boolean
}

const CARD_TYPES: { value: CardType; label: string }[] = [
  { value: 'basic', label: 'Basic' },
  { value: 'cloze', label: 'Cloze deletion' },
  { value: 'image', label: 'Image' },
  { value: 'multiple_choice', label: 'Multiple choice' },
]

export function CardFormModal({ isOpen, onClose, onSubmit, initialCard, isLoading }: CardFormModalProps) {
  const [cardType, setCardType] = useState<CardType>('basic')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [clozeText, setClozeText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [choices, setChoices] = useState<ChoiceItem[]>([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
  ])
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (initialCard) {
      setCardType(initialCard.card_type)
      setFront(initialCard.front)
      setBack(initialCard.back || '')
      setClozeText(initialCard.cloze_text || '')
      setImageUrl(initialCard.image_url || '')
      setChoices(initialCard.choices?.length ? initialCard.choices : [{ text: '', is_correct: true }, { text: '', is_correct: false }])
      setTagsInput((initialCard.tags || []).join(', '))
    } else {
      setCardType('basic')
      setFront('')
      setBack('')
      setClozeText('')
      setImageUrl('')
      setChoices([{ text: '', is_correct: true }, { text: '', is_correct: false }])
      setTagsInput('')
    }
  }, [initialCard, isOpen])

  const updateChoice = (index: number, field: keyof ChoiceItem, value: string | boolean) => {
    setChoices((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
  }

  const addChoice = () => setChoices((prev) => [...prev, { text: '', is_correct: false }])
  const removeChoice = (index: number) => setChoices((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)

    const payload: Omit<CardCreatePayload, 'deck_id'> = {
      card_type: cardType,
      front: cardType === 'cloze' ? clozeText : front,
      tags,
    }

    if (cardType === 'basic') payload.back = back
    if (cardType === 'cloze') payload.cloze_text = clozeText
    if (cardType === 'image') {
      payload.image_url = imageUrl
      payload.back = back
    }
    if (cardType === 'multiple_choice') {
      payload.choices = choices.filter((c) => c.text.trim())
    }

    onSubmit(payload)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialCard ? 'Edit card' : 'Add a card'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <p className="label-eyebrow">Card type</p>
          <div className="flex flex-wrap gap-2">
            {CARD_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                disabled={!!initialCard}
                onClick={() => setCardType(t.value)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  cardType === t.value
                    ? 'bg-synapse-500/20 text-synapse-300 ring-1 ring-synapse-400/40'
                    : 'bg-ink-700/50 text-ink-300 hover:bg-ink-600/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {cardType === 'basic' && (
          <>
            <Textarea label="Front" placeholder="Question or prompt" value={front} onChange={(e) => setFront(e.target.value)} required rows={2} autoFocus />
            <Textarea label="Back" placeholder="Answer" value={back} onChange={(e) => setBack(e.target.value)} required rows={2} />
          </>
        )}

        {cardType === 'cloze' && (
          <Textarea
            label="Cloze text"
            placeholder="The mitochondria is the {{c1::powerhouse}} of the {{c2::cell}}"
            value={clozeText}
            onChange={(e) => setClozeText(e.target.value)}
            required
            rows={3}
            autoFocus
          />
        )}

        {cardType === 'image' && (
          <>
            <Input label="Image URL" placeholder="https://…" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required autoFocus />
            <Textarea label="Prompt / question" placeholder="What is shown in this image?" value={front} onChange={(e) => setFront(e.target.value)} required rows={2} />
            <Textarea label="Answer" placeholder="Answer" value={back} onChange={(e) => setBack(e.target.value)} rows={2} />
          </>
        )}

        {cardType === 'multiple_choice' && (
          <>
            <Textarea label="Question" placeholder="What is the capital of Japan?" value={front} onChange={(e) => setFront(e.target.value)} required rows={2} autoFocus />
            <div className="space-y-2.5">
              <p className="label-eyebrow">Choices (select the correct one)</p>
              {choices.map((choice, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="correct-choice"
                    checked={choice.is_correct}
                    onChange={() => setChoices((prev) => prev.map((c, idx) => ({ ...c, is_correct: idx === i })))}
                    className="h-4 w-4 accent-synapse-500"
                  />
                  <input
                    className="input-field flex-1"
                    placeholder={`Choice ${i + 1}`}
                    value={choice.text}
                    onChange={(e) => updateChoice(i, 'text', e.target.value)}
                  />
                  {choices.length > 2 && (
                    <button type="button" onClick={() => removeChoice(i)} className="p-1.5 text-ink-500 hover:text-decay-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addChoice} className="flex items-center gap-1.5 text-sm text-synapse-300 hover:text-synapse-200">
                <Plus className="h-3.5 w-3.5" /> Add choice
              </button>
            </div>
          </>
        )}

        <Input
          label="Tags (comma-separated)"
          placeholder="grammar, verbs, irregular"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1" isLoading={isLoading}>
            {initialCard ? 'Save changes' : 'Add card'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
