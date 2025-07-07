'use client'

import { useSessionRefresh } from '@/hooks/useSessionRefresh'

export const SessionManager = () => {
  // Використовуємо хук для автоматичного оновлення сесії
  useSessionRefresh()
  
  // Цей компонент не рендерить нічого, він просто керує сесією в фоні
  return null
} 