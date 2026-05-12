import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function createRandomPdfPath() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
  return `${hex}.pdf`
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      filename?: unknown
      contentType?: unknown
    }

    const filename = typeof payload.filename === 'string' ? payload.filename.trim() : ''
    const contentType = typeof payload.contentType === 'string' ? payload.contentType : ''

    if (!filename) {
      return NextResponse.json(
        { error: 'Missing filename' },
        { status: 400 }
      )
    }

    const isPdfByMime = contentType === 'application/pdf'
    const isPdfByName = filename.toLowerCase().endsWith('.pdf')

    if (!isPdfByMime && !isPdfByName) {
      return NextResponse.json(
        { error: 'Only PDF files are accepted' },
        { status: 400 }
      )
    }

    const storagePath = createRandomPdfPath()
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.storage
      .from('pdfs')
      .createSignedUploadUrl(storagePath)

    if (error || !data) {
      console.error('Create signed upload URL error:', error)
      return NextResponse.json(
        { error: `Failed to prepare upload: ${error?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      storagePath: data.path,
      token: data.token,
    })
  } catch (error) {
    console.error('Create signed upload URL request failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
