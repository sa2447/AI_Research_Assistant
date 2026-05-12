export interface TextChunk {
  content: string
  pageNumber: number | null
}

export function chunkText(
  text: string,
  pageCount: number,
  chunkSize = 500,
  overlap = 100
): TextChunk[] {
  const chunks: TextChunk[] = []
  const step = chunkSize - overlap

  if (text.length === 0) {
    return chunks
  }

  // Estimate chars per page for page number heuristic
  const charsPerPage = text.length / pageCount

  for (let i = 0; i < text.length; i += step) {
    const end = Math.min(i + chunkSize, text.length)
    const content = text.substring(i, end)

    // Estimate page number based on character offset
    // Use the middle of the chunk as the reference point
    const middleOffset = i + (end - i) / 2
    const estimatedPage = Math.ceil(middleOffset / charsPerPage)
    const pageNumber = Math.max(1, Math.min(pageCount, estimatedPage))

    chunks.push({
      content,
      pageNumber,
    })

    // Stop if we've reached the end
    if (end === text.length) {
      break
    }
  }

  return chunks
}
