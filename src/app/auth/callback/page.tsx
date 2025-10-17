'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = () => {
      const accessToken = searchParams?.get('access_token')
      const refreshToken = searchParams?.get('refresh_token')
      const type = searchParams?.get('type')
      const tokenHash = searchParams?.get('token')
      const error = searchParams?.get('error')
      const errorDescription = searchParams?.get('error_description')

      // Handle OAuth errors
      if (error) {
        console.error('OAuth error:', error, errorDescription)
        router.replace(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`)
        return
      }

      // Handle password recovery
      if (type === 'recovery') {
        if (accessToken && refreshToken) {
          const resetUrl = `/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}&type=recovery`
          router.replace(resetUrl)
          return
        } else if (tokenHash) {
          const resetUrl = `/auth/reset-password?token=${tokenHash}&type=recovery`
          router.replace(resetUrl)
          return
        }
      }

      // Handle email confirmation
      if (type === 'signup') {
        if (accessToken && refreshToken) {
          const homeUrl = `/?access_token=${accessToken}&refresh_token=${refreshToken}&type=signup`
          router.replace(homeUrl)
          return
        }
      }

      // Handle OAuth callback (implicit flow with hash fragment)
      // Supabase client with detectSessionInUrl will automatically handle tokens in URL hash
      if (typeof window !== 'undefined' && window.location.hash) {
        setTimeout(() => {
          router.replace('/')
        }, 1000)
        return
      }

      // If we have access_token in query params (OAuth callback)
      if (accessToken) {
        router.replace('/')
        return
      }

      // Default fallback - redirect to home
      router.replace('/')
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
