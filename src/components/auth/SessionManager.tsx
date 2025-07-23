'use client'

import { useSessionRefresh } from '@/hooks/useSessionRefresh'

export const SessionManager = () => {
  // Use hook for automatic session refresh
  useSessionRefresh()
  
  // This component does not render anything, it simply manages the session in the background
  return null
} 