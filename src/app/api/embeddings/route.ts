import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { chunkText } from '@/lib/utils/chunkText'
import { generateEmbeddingsBatched } from '@/lib/openai/embeddings'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { documentId, rawText, pageCount } = await request.json()

    // Validate input - check for missing fields (pageCount can be 0)
    if (!documentId || !rawText || pageCount === undefined || pageCount === null) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, rawText, pageCount' },
        { status: 400 }
      )
    }

    // Chunk the text
    const chunks = chunkText(rawText, pageCount)

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No chunks generated from text' },
        { status: 400 }
      )
    }

    // Generate embeddings in batches
    const chunkContents = chunks.map((c) => c.content)
    const embeddings = await generateEmbeddingsBatched(chunkContents, 100)

    // Prepare rows for insertion
    const rows = chunks.map((chunk, index) => ({
      document_id: documentId,
      page_number: chunk.pageNumber,
      content: chunk.content,
      embedding: embeddings[index],
    }))

    // Insert into Supabase in batches of 50
    const supabase = createServerSupabaseClient()
    let totalInserted = 0

    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50)
      const { error } = await supabase.from('chunks').insert(batch)

      if (error) {
        console.error('Chunk insertion error:', error)
        return NextResponse.json(
          { error: 'Failed to insert chunks into database' },
          { status: 500 }
        )
      }

      totalInserted += batch.length
    }

    return NextResponse.json({
      chunksCreated: totalInserted,
    })
  } catch (error) {
    console.error('Embeddings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
