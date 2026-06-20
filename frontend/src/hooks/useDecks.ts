import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { decksApi, type DeckCreatePayload } from '@/api/decks'
import { getApiErrorMessage } from '@/api/client'
import { cacheDecks, getCachedDecks } from '@/lib/db'
import { useOnlineStatus } from './useOfflineSync'
import type { Deck } from '@/types'

export function useDecks() {
  const isOnline = useOnlineStatus()

  return useQuery<Deck[]>({
    queryKey: ['decks'],
    queryFn: async () => {
      if (!isOnline) {
        return getCachedDecks()
      }
      const { data } = await decksApi.list()
      await cacheDecks(data)
      return data
    },
    staleTime: 30 * 1000,
  })
}

export function useDeck(id: number | undefined) {
  return useQuery({
    queryKey: ['deck', id],
    queryFn: async () => {
      const { data } = await decksApi.get(id!)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: DeckCreatePayload) => decksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
      toast.success('Deck created')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useUpdateDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DeckCreatePayload> }) =>
      decksApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
      queryClient.invalidateQueries({ queryKey: ['deck', variables.id] })
      toast.success('Deck updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => decksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
      toast.success('Deck deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
