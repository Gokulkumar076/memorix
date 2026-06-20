import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { cardsApi, type CardCreatePayload, type CardUpdatePayload } from '@/api/cards'
import { getApiErrorMessage } from '@/api/client'

export function useDeckCards(deckId: number | undefined) {
  return useQuery({
    queryKey: ['cards', deckId],
    queryFn: async () => {
      const { data } = await cardsApi.listByDeck(deckId!)
      return data
    },
    enabled: !!deckId,
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CardCreatePayload) => cardsApi.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', variables.deck_id] })
      queryClient.invalidateQueries({ queryKey: ['decks'] })
      toast.success('Card created')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CardUpdatePayload }) =>
      cardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success('Card updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['decks'] })
      toast.success('Card deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
