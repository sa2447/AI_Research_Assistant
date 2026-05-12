import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const documentId =
      body && typeof body.documentId === 'string' ? body.documentId : ''

    if (!documentId) {
      return NextResponse.json(
        { error: 'Missing documentId' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('chats')
      .insert({
        title: 'New Chat',
        document_id: documentId,
        saved: false,
      })
      .select('id')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: `Failed to create chat: ${error?.message || 'Unknown database error'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ chatId: data.id })
  } catch (error) {
    console.error('Create chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
