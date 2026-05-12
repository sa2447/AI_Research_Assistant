export interface RetrievedChunk {
  id: string
  document_id: string
  page_number: number | null
  content: string
  similarity: number
}

export function deduplicateChunks(
  chunks: RetrievedChunk[],
  threshold = 0.8
): RetrievedChunk[] {
  const deduped: RetrievedChunk[] = []

  for (const chunk of chunks) {
    // Check if this chunk is similar to any already kept chunk
    const isDuplicate = deduped.some((kept) => {
      const similarity = calculateSimilarity(chunk.content, kept.content)
      return similarity >= threshold
    })

    if (!isDuplicate) {
      deduped.push(chunk)
    }
  }

  return deduped
}

function calculateSimilarity(text1: string, text2: string): number {
  const shorter = Math.min(text1.length, text2.length)
  if (shorter === 0) return text1 === text2 ? 1 : 0

  let matches = 0
  for (let i = 0; i < shorter; i++) {
    if (text1[i] === text2[i]) matches++
  }

  return matches / Math.max(text1.length, text2.length)
}

export function assembleContext(chunks: RetrievedChunk[]): string {
  const maxChars = 12000 // Soft limit for ~3000 tokens

  let contextBlock = ''
  let charCount = 0

  for (const chunk of chunks) {
    const chunkText = `[Page ${chunk.page_number ?? '?'}]\n${chunk.content}`

    if (charCount + chunkText.length > maxChars) {
      break
    }

    if (contextBlock.length > 0) {
      contextBlock += '\n\n---\n\n'
      charCount += 8
    }

    contextBlock += chunkText
    charCount += chunkText.length
  }

  return contextBlock
}
