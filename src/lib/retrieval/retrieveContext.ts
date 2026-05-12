import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateEmbeddings } from '@/lib/openai/embeddings'
import {
  assembleContext,
  deduplicateChunks,
  RetrievedChunk,
} from '@/lib/utils/assembleContext'

export interface RetrievalResult {
  contextBlock: string
  sources: RetrievedChunk[]
}

export async function retrieveContext(
  question: string,
  documentId: string
): Promise<RetrievalResult> {
  // Generate embedding for the question
  const embeddings = await generateEmbeddings([question])
  const queryEmbedding = embeddings[0]

  // Call the match_chunks RPC function
  const supabase = createServerSupabaseClient()
  const { data: chunks, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_document_id: documentId,
    match_count: 10,
  })

  if (error) {
    throw new Error(`Retrieval error: ${error.message}`)
  }

  if (!chunks || chunks.length === 0) {
    return {
      contextBlock: 'No relevant context found in the document.',
      sources: [],
    }
  }

  // Deduplicate chunks
  const deduped = deduplicateChunks(chunks as RetrievedChunk[])

  // Assemble context
  const contextBlock = assembleContext(deduped)

  return {
    contextBlock,
    sources: deduped,
  }
}
