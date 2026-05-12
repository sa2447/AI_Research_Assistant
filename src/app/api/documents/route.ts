import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      const isMissingTable =
        /could not find the table 'public\.documents'/i.test(error.message) ||
        /relation "documents" does not exist/i.test(error.message)

      return NextResponse.json(
        {
          error: isMissingTable
            ? 'Failed to fetch documents: documents table is missing. Run SUPABASE_SETUP.sql in your Supabase SQL editor.'
            : `Failed to fetch documents: ${error.message}`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
