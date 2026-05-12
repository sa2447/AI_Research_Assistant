import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { normalizeText } from '@/lib/utils/normalizeText'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

async function parsePdfWithPdfjs(pdfBuffer: Buffer) {
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: pdfBuffer })
  const parsed = await parser.getText()
  await parser.destroy()

  return {
    rawText: parsed.text,
    pageCount: parsed.total,
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      filename?: unknown
      storagePath?: unknown
    }
    const filename = typeof payload.filename === 'string' ? payload.filename.trim() : ''
    const storagePath = typeof payload.storagePath === 'string' ? payload.storagePath.trim() : ''

    // Validation
    if (!filename) {
      return NextResponse.json(
        { error: 'Missing filename' },
        { status: 400 }
      )
    }

    if (!storagePath) {
      return NextResponse.json(
        { error: 'Missing storagePath' },
        { status: 400 }
      )
    }

    if (!storagePath.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are accepted' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('pdfs')
      .download(storagePath)

    if (downloadError || !fileBlob) {
      console.error('Supabase download error:', downloadError)
      return NextResponse.json(
        { error: `Failed to load uploaded file: ${downloadError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Convert file to buffer
    const buffer = await fileBlob.arrayBuffer()
    const pdfBuffer = Buffer.from(buffer)

    if (pdfBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Extract text from the PDF for embeddings and downstream chat use
    const parsed = await parsePdfWithPdfjs(pdfBuffer)
    const rawText = normalizeText(parsed.rawText)
    const pageCount = parsed.pageCount

    // Insert into documents table
    const { data: docData, error: dbError } = await supabase
      .from('documents')
      .insert({
        filename,
        storage_path: storagePath,
      })
      .select('id')
      .single()

    if (dbError || !docData) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: `Failed to save document metadata: ${dbError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      documentId: docData.id,
      filename,
      storagePath,
      pageCount,
      rawText,
    })
  } catch (err) {
    console.error('Upload error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 500 }
    )
  }
}
