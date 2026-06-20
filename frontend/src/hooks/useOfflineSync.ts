import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { reviewsApi } from '@/api/reviews'
import { getPendingReviews, markReviewsSynced } from '@/lib/db'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return isOnline
}

export function useOfflineSync() {
  const isOnline = useOnlineStatus()

  const syncPendingReviews = useCallback(async () => {
    const pending = await getPendingReviews()
    if (pending.length === 0) return

    try {
      const payload = pending.map((r) => ({
        card_id: r.card_id,
        rating: r.rating,
        duration_ms: r.duration_ms,
      }))
      const { data } = await reviewsApi.syncOffline(payload)
      const ids = pending.map((r) => r.id!).filter(Boolean)
      await markReviewsSynced(ids)
      if (data.synced > 0) {
        toast.success(`Synced ${data.synced} offline review${data.synced > 1 ? 's' : ''}`)
      }
    } catch {
      // Will retry on next reconnect
    }
  }, [])

  useEffect(() => {
    if (isOnline) {
      syncPendingReviews()
    }
  }, [isOnline, syncPendingReviews])

  return { isOnline, syncPendingReviews }
}
