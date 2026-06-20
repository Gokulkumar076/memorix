import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Sparkles, Search, Layers } from 'lucide-react'
import { useDecks, useCreateDeck, useUpdateDeck, useDeleteDeck } from '@/hooks/useDecks'
import { DeckCard } from '@/components/deck/DeckCard'
import { DeckFormModal } from '@/components/deck/DeckFormModal'
import { AIGeneratorModal } from '@/components/cards/AIGeneratorModal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeckCardSkeleton } from '@/components/ui/Loaders'
import type { Deck } from '@/types'
import type { DeckCreatePayload } from '@/api/decks'

export default function DecksPage() {
  const { data: decks, isLoading } = useDecks()
  const createDeck = useCreateDeck()
  const updateDeck = useUpdateDeck()
  const deleteDeck = useDeleteDeck()

  const [formOpen, setFormOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Deck | null>(null)

  const filteredDecks = (decks ?? []).filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = (data: DeckCreatePayload) => {
    if (editingDeck) {
      updateDeck.mutate(
        { id: editingDeck.id, data },
        { onSuccess: () => { setFormOpen(false); setEditingDeck(null) } }
      )
    } else {
      createDeck.mutate(data, { onSuccess: () => setFormOpen(false) })
    }
  }

  return (
    <div className="space-y-7">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <p className="label-eyebrow mb-1.5">Library</p>
          <h1 className="text-2xl sm:text-3xl font-display font-medium">Your decks</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" onClick={() => setAiOpen(true)}>
            <Sparkles className="h-4 w-4" />
            AI Generate
          </Button>
          <Button onClick={() => { setEditingDeck(null); setFormOpen(true) }}>
            <Plus className="h-4 w-4" />
            New deck
          </Button>
        </div>
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-void-500" />
        <input
          className="input-field pl-10"
          placeholder="Search decks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <DeckCardSkeleton key={i} />)}
        </div>
      ) : filteredDecks.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-7 w-7" />}
          title={search ? 'No matching decks' : 'No decks yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Create your first deck manually, or let AI generate one from a topic.'
          }
          action={
            !search && (
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setAiOpen(true)}>
                  <Sparkles className="h-4 w-4" /> Generate with AI
                </Button>
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4" /> Create deck
                </Button>
              </div>
            )
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onEdit={(d) => { setEditingDeck(d); setFormOpen(true) }}
              onDelete={(d) => setConfirmDelete(d)}
            />
          ))}
        </div>
      )}

      <DeckFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingDeck(null) }}
        onSubmit={handleSubmit}
        initialDeck={editingDeck}
        isLoading={createDeck.isPending || updateDeck.isPending}
      />

      <AIGeneratorModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />

      {confirmDelete && (
        <DeleteConfirmModal
          deckName={confirmDelete.name}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteDeck.mutate(confirmDelete.id)
            setConfirmDelete(null)
          }}
        />
      )}
    </div>
  )
}

function DeleteConfirmModal({
  deckName,
  onCancel,
  onConfirm,
}: {
  deckName: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-void-950/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative glass-bright rounded-2xl p-6 max-w-sm w-full"
      >
        <h3 className="font-display text-lg font-medium mb-2">Delete "{deckName}"?</h3>
        <p className="text-sm text-void-400 mb-6">
          This will permanently delete the deck and all its cards. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">Delete</Button>
        </div>
      </motion.div>
    </div>
  )
}
