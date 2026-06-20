import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Play, Sparkles, FileUp, BookX } from 'lucide-react'
import { useDeck } from '@/hooks/useDecks'
import { useDeckCards, useCreateCard, useUpdateCard, useDeleteCard } from '@/hooks/useCards'
import { CardFormModal } from '@/components/cards/CardFormModal'
import { CardListItem } from '@/components/cards/CardListItem'
import { AIGeneratorModal } from '@/components/cards/AIGeneratorModal'
import { ImportExportPanel } from '@/components/cards/ImportExportPanel'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Loaders'
import type { Card } from '@/types'
import type { CardCreatePayload } from '@/api/cards'

export default function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const id = Number(deckId)
  const navigate = useNavigate()

  const { data: deck, isLoading: deckLoading } = useDeck(id)
  const { data: cards, isLoading: cardsLoading } = useDeckCards(id)
  const createCard = useCreateCard()
  const updateCard = useUpdateCard()
  const deleteCard = useDeleteCard()

  const [cardFormOpen, setCardFormOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [importExportOpen, setImportExportOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Card | null>(null)

  const handleSubmit = (data: Omit<CardCreatePayload, 'deck_id'>) => {
    if (editingCard) {
      updateCard.mutate(
        { id: editingCard.id, data },
        { onSuccess: () => { setCardFormOpen(false); setEditingCard(null) } }
      )
    } else {
      createCard.mutate({ ...data, deck_id: id }, { onSuccess: () => setCardFormOpen(false) })
    }
  }

  const handleToggleSuspend = (card: Card) => {
    updateCard.mutate({ id: card.id, data: { is_suspended: !card.is_suspended } })
  }

  if (deckLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    )
  }

  if (!deck) return null

  return (
    <div className="space-y-7">
      <button
        onClick={() => navigate('/decks')}
        className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-100 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to decks
      </button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: `${deck.cover_color}22` }}
            >
              {deck.cover_emoji}
            </div>
            <div>
              <h1 className="text-2xl font-display font-medium mb-1.5">{deck.name}</h1>
              <p className="text-sm text-ink-400 mb-3 max-w-md">{deck.description || 'No description'}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="neutral">{deck.card_count} cards</Badge>
                {deck.due_count > 0 && <Badge variant="decay">{deck.due_count} due</Badge>}
                {deck.new_count > 0 && <Badge variant="recall">{deck.new_count} new</Badge>}
              </div>
            </div>
          </div>

          <Link to={`/decks/${id}/study`}>
            <Button disabled={deck.card_count === 0}>
              <Play className="h-4 w-4" />
              Study now
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-display font-medium">Cards</h2>
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="sm" onClick={() => setImportExportOpen(true)}>
            <FileUp className="h-3.5 w-3.5" />
            Import / Export
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAiOpen(true)}>
            <Sparkles className="h-3.5 w-3.5" />
            AI Generate
          </Button>
          <Button size="sm" onClick={() => { setEditingCard(null); setCardFormOpen(true) }}>
            <Plus className="h-3.5 w-3.5" />
            Add card
          </Button>
        </div>
      </div>

      {cardsLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="space-y-2.5">
          {cards.map((card) => (
            <CardListItem
              key={card.id}
              card={card}
              onEdit={(c) => { setEditingCard(c); setCardFormOpen(true) }}
              onDelete={(c) => setConfirmDelete(c)}
              onToggleSuspend={handleToggleSuspend}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookX className="h-7 w-7" />}
          title="No cards yet"
          description="Add cards manually or generate a full set instantly with AI."
          action={
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setAiOpen(true)}>
                <Sparkles className="h-4 w-4" /> Generate with AI
              </Button>
              <Button onClick={() => setCardFormOpen(true)}>
                <Plus className="h-4 w-4" /> Add card
              </Button>
            </div>
          }
        />
      )}

      <CardFormModal
        isOpen={cardFormOpen}
        onClose={() => { setCardFormOpen(false); setEditingCard(null) }}
        onSubmit={handleSubmit}
        initialCard={editingCard}
        isLoading={createCard.isPending || updateCard.isPending}
      />

      <AIGeneratorModal isOpen={aiOpen} onClose={() => setAiOpen(false)} deckId={id} />

      <ImportExportPanel
        isOpen={importExportOpen}
        onClose={() => setImportExportOpen(false)}
        deckId={id}
        deckName={deck.name}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass-bright rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="font-display text-lg font-medium mb-2">Delete this card?</h3>
            <p className="text-sm text-ink-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)} className="flex-1">Cancel</Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => { deleteCard.mutate(confirmDelete.id); setConfirmDelete(null) }}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
