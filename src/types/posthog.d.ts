// PostHog global types for instrumentation-client.js integration

import { PostHog } from 'posthog-js'

declare global {
  interface Window {
    posthog?: PostHog
  }
}

export {}
