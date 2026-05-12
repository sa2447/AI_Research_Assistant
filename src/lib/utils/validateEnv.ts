/**
 * Validates that all required environment variables are set at startup
 * Throws an error if any required vars are missing or invalid
 */
export function validateEnvironment(): void {
  const required = [
    'OPENAI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing: string[] = []
  const invalid: string[] = []

  for (const key of required) {
    const value = process.env[key]

    if (!value) {
      missing.push(key)
      continue
    }

    // Basic validation for specific vars
    if (key === 'OPENAI_API_KEY' && !value.startsWith('sk-')) {
      invalid.push(`${key} appears to be invalid (should start with 'sk-')`)
    }

    if ((key === 'SUPABASE_URL' || key === 'NEXT_PUBLIC_SUPABASE_URL') && !value.startsWith('https://')) {
      invalid.push(`${key} should be a valid HTTPS URL`)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nSee .env.example for guidance.`
    )
  }

  if (invalid.length > 0) {
    throw new Error(
      `Invalid environment variables:\n${invalid.map((k) => `  - ${k}`).join('\n')}`
    )
  }
}
