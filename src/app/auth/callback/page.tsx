'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = () => {
      // Get URL parameters
      const accessToken = searchParams?.get('access_token')
      const refreshToken = searchParams?.get('refresh_token')
      const type = searchParams?.get('type')
      const tokenHash = searchParams?.get('token') // For old Supabase links
      
      console.log('Auth callback params:', {
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshToken ? 'present' : 'missing',
        type,
        tokenHash: tokenHash ? 'present' : 'missing'
      })

      // Handle password recovery
      if (type === 'recovery') {
        if (accessToken && refreshToken) {
          // New format - redirect to reset password with tokens
          const resetUrl = `/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}&type=recovery`
          console.log('Redirecting to reset password with tokens')
          router.replace(resetUrl)
          return
        } else if (tokenHash) {
          // Old format - redirect to reset password with token
          const resetUrl = `/auth/reset-password?token=${tokenHash}&type=recovery`
          console.log('Redirecting to reset password with legacy token')
          router.replace(resetUrl)
          return
        }
      }

      // Handle email confirmation
      if (type === 'signup') {
        if (accessToken && refreshToken) {
          // Set session and redirect to home
          const homeUrl = `/?access_token=${accessToken}&refresh_token=${refreshToken}&type=signup`
          console.log('Redirecting to home after signup confirmation')
          router.replace(homeUrl)
          return
        }
      }

      // Default fallback - redirect to login
      console.log('No valid callback parameters, redirecting to login')
      router.replace('/auth/login?error=invalid-callback')
    }

    handleCallback()
  }, [searchParams, router])

  return <LoadingScreen />
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
