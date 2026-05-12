import { createClient } from '@supabase/supabase-js'

function sanitize(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, '')
}

function looksLikeSupabaseKey(value?: string) {
  if (!value) return false

  const jwtLike = /^[^.]+\.[^.]+\.[^.]+$/.test(value)
  const sbKeyLike = /^sb_(publishable|secret)_[A-Za-z0-9_-]+$/.test(value)
  const placeholderLike = /(your_|replace|placeholder|example)/i.test(value)

  return (jwtLike || sbKeyLike) && !placeholderLike
}

export function createServerSupabaseClient() {
  const serverUrl = sanitize(process.env.SUPABASE_URL)
  const publicUrl = sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const resolvedUrl = /^https?:\/\//.test(serverUrl || '')
    ? serverUrl
    : publicUrl
  const serviceRoleKey = sanitize(process.env.SUPABASE_SERVICE_ROLE_KEY)
  const serverAnonKey = sanitize(process.env.SUPABASE_ANON_KEY)
  const publicAnonKey = sanitize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const resolvedKey = looksLikeSupabaseKey(serviceRoleKey)
    ? serviceRoleKey
    : looksLikeSupabaseKey(serverAnonKey)
      ? serverAnonKey
      : looksLikeSupabaseKey(publicAnonKey)
        ? publicAnonKey
        : null

  if (!resolvedUrl || !/^https?:\/\//.test(resolvedUrl)) {
    throw new Error(
      'Supabase server client is not configured. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL to a valid HTTP(S) URL.'
    )
  }

  if (!resolvedKey) {
    throw new Error(
      'Supabase server client is not configured. Set a valid SUPABASE_SERVICE_ROLE_KEY (preferred) or valid anon key env values.'
    )
  }

  return createClient(
    resolvedUrl,
    resolvedKey
  )
}
