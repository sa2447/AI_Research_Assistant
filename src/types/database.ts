export interface Document {
  id: string
  filename: string
  storage_path: string
  created_at: string
}

export interface Chat {
  id: string
  title: string
  document_id: string
  saved: boolean
  created_at: string
}

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Chunk {
  id: string
  document_id: string
  page_number: number | null
  content: string
  embedding?: number[]
}
