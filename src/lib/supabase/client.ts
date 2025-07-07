import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  if (!supabaseClient) {
    console.log('🔧 Supabase Client: Creating new client...')
    
    try {
      supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
          },
          global: {
            headers: {
              'X-Client-Info': 'hibody-platform'
            }
          },
          db: {
            schema: 'public'
          },
          realtime: {
            params: {
              eventsPerSecond: 2
            }
          }
        }
      )
      console.log('✅ Supabase Client: Client created successfully')
    } catch (error) {
      console.error('❌ Supabase Client: Failed to create client:', error)
      throw error
    }
  }
  return supabaseClient
}

// Експортуємо функцію для отримання клієнта
export const supabase = createClient() 