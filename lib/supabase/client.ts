import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Guard against missing env vars during build/prerender
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '@supabase/ssr: Supabase URL and API key are required. ' +
      'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    )
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)

  return supabaseClient
}
