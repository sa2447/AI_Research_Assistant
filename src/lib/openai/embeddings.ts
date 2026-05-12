import { openai } from './client'

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return []
  }

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  })

  return response.data.map((d) => d.embedding)
}

export async function generateEmbeddingsBatched(
  texts: string[],
  batchSize = 100
): Promise<number[][]> {
  const embeddings: number[][] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const batchEmbeddings = await generateEmbeddings(batch)
    embeddings.push(...batchEmbeddings)
  }

  return embeddings
}
