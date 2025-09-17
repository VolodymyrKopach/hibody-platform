'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

// PostHog is now initialized via instrumentation-client.js (Next.js 15.3+)
// This provides better performance and follows Next.js best practices

/**
 * Component to handle automatic page view tracking
 */
function PostHogPageView(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // PostHog should be available via instrumentation-client.js
    const posthogInstance = typeof window !== 'undefined' ? window.posthog || posthog : null
    
    if (pathname && posthogInstance && typeof posthogInstance.capture === 'function') {
      try {
        let url = window.origin + pathname
        if (searchParams && searchParams.toString()) {
          url = url + `?${searchParams.toString()}`
        }
        
        posthogInstance.capture('$pageview', {
          $current_url: url,
          pathname: pathname,
          search_params: searchParams?.toString() || '',
        })
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📄 Page view tracked (instrumentation):', url)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Failed to track page view:', error)
        }
      }
    } else if (process.env.NODE_ENV === 'development' && pathname) {
      console.log('📄 Page view not tracked: PostHog not available via instrumentation')
    }
  }, [pathname, searchParams])

  return null
}

interface PostHogProviderProps {
  children: React.ReactNode
}

/**
 * PostHog Analytics Provider
 * Wraps the app with PostHog context and handles automatic page tracking
 */
export function PostHogProvider({ children }: PostHogProviderProps) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}

export default PostHogProvider
