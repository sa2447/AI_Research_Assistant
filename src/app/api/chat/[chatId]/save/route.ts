import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params

    if (!chatId) {
      return NextResponse.json(
        { error: 'Missing chatId' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const title = body.title || `Chat from ${new Date().toLocaleDateString()}`

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('chats')
      .update({ saved: true, title })
      .eq('id', chatId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save chat' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
