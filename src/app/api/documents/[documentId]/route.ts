import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ documentId: string }>
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { documentId } = await context.params

    if (!documentId) {
      return NextResponse.json(
        { error: 'Missing documentId' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, storage_path')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { error: fetchError?.message || 'Document not found' },
        { status: 404 }
      )
    }

    const { error: storageError } = await supabase.storage
      .from('pdfs')
      .remove([document.storage_path])

    if (storageError) {
      return NextResponse.json(
        { error: `Failed to remove file from storage: ${storageError.message}` },
        { status: 500 }
      )
    }

    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to delete document: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}