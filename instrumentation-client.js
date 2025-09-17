// instrumentation-client.js
// Next.js 15.3+ PostHog Integration
import posthog from 'posthog-js'

// Initialize PostHog with improved configuration
if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
  
  if (posthogKey && posthogKey !== 'phc_your_key_here') {
    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
        defaults: '2025-05-24', // Use latest feature defaults
        
        // Performance optimizations
        capture_pageview: false, // We'll handle this manually
        capture_pageleave: true,
        
        // Privacy settings
        respect_dnt: true,
        opt_out_capturing_by_default: false,
        
        // Development settings
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.debug()
          }
        },
        
        // Error handling
        on_request_error: (error) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ PostHog request error:', error)
          }
        }
      })
      
      // Set global reference for easier access
      window.posthog = posthog
      
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ PostHog initialization failed:', error)
      }
    }
  }
}

export default posthog
