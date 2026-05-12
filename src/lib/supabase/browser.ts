import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserSupabase: SupabaseClient | null = null

function readBrowserSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !/^https?:\/\//.test(url)) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL in next.config fallback) to a valid https URL.'
    )
  }

  if (!anonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY in next.config fallback).'
    )
  }

  return { url, anonKey }
}

export function getBrowserSupabaseClient(): SupabaseClient {
  if (browserSupabase) {
    return browserSupabase
  }

  const { url, anonKey } = readBrowserSupabaseConfig()
  browserSupabase = createClient(url, anonKey)
  return browserSupabase
}
