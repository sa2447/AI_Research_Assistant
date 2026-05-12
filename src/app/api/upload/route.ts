import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { normalizeText } from '@/lib/utils/normalizeText'
import path from 'path'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

async function parsePdfWithPdfjs(pdfBuffer: Buffer) {
  const { pathToFileURL } = await import('url')

  const workerPath = path.join(
    process.cwd(),
    'node_modules',
    'pdfjs-dist',
    'legacy',
    'build',
    'pdf.worker.mjs'
  )
  const workerUrl = pathToFileURL(workerPath).href

  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
    useWorkerFetch: false,
    disableFontFace: true,
  }).promise

  let rawText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item) => {
        const textItem = item as { str?: string }
        return textItem.str || ''
      })
      .join(' ')

    rawText += `${pageText}\n`
    page.cleanup()
  }

  return {
    rawText,
    pageCount: pdf.numPages,
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are accepted' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const pdfBuffer = Buffer.from(buffer)

    // Extract text from the PDF for embeddings and downstream chat use
    const parsed = await parsePdfWithPdfjs(pdfBuffer)
    const rawText = normalizeText(parsed.rawText)
    const pageCount = parsed.pageCount

    // Upload to Supabase Storage
    const supabase = createServerSupabaseClient()
    const storagePath = `${crypto.getRandomValues(new Uint8Array(16)).reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '')}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase storage error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload file to storage: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Insert into documents table
    const { data: docData, error: dbError } = await supabase
      .from('documents')
      .insert({
        filename: file.name,
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
      filename: file.name,
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
