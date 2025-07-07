import { useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'

export const useSessionRefresh = () => {
  const { user, refreshSession } = useAuth()

  useEffect(() => {
    if (!user) return

    // Перевіряємо і оновлюємо сесію кожні 30 хвилин
    const interval = setInterval(async () => {
      console.log('Checking session validity...')
      await refreshSession()
    }, 30 * 60 * 1000) // 30 хвилин

    // Також перевіряємо сесію при фокусі на вікно
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('Window focused, checking session...')
        await refreshSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, refreshSession])
} 