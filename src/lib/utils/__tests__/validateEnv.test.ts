import { validateEnvironment } from '@/lib/utils/validateEnv'

describe('validateEnvironment', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('does not throw when required vars are valid', () => {
    process.env.OPENAI_API_KEY = 'sk-test-key'
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_123'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_123'

    expect(() => validateEnvironment()).not.toThrow()
  })

  it('throws when required vars are missing', () => {
    delete process.env.OPENAI_API_KEY

    expect(() => validateEnvironment()).toThrow('Missing required environment variables')
  })

  it('throws when OPENAI_API_KEY format is invalid', () => {
    process.env.OPENAI_API_KEY = 'invalid-key'
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_123'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_123'

    expect(() => validateEnvironment()).toThrow('OPENAI_API_KEY appears to be invalid')
  })
})
