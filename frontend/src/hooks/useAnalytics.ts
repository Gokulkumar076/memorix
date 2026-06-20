import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics'

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const { data } = await analyticsApi.summary()
      return data
    },
    staleTime: 60 * 1000,
  })
}

export function useDeckPerformance() {
  return useQuery({
    queryKey: ['analytics', 'deckPerformance'],
    queryFn: async () => {
      const { data } = await analyticsApi.deckPerformance()
      return data
    },
    staleTime: 60 * 1000,
  })
}
