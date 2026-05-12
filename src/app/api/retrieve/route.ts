import { NextRequest, NextResponse } from 'next/server'
import { retrieveContext } from '@/lib/retrieval/retrieveContext'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { question, documentId } = await request.json()

    // Validate input
    if (!question || !documentId) {
      return NextResponse.json(
        { error: 'Missing required fields: question, documentId' },
        { status: 400 }
      )
    }

    const result = await retrieveContext(question, documentId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Retrieval error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
