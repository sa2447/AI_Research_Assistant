import { NextRequest, NextResponse } from 'next/server'
import { streamChat } from '@/lib/openai/chat'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { question, documentId, chatId } = await request.json()

    // Validate input
    if (!question || !documentId || !chatId) {
      return NextResponse.json(
        { error: 'Missing required fields: question, documentId, chatId' },
        { status: 400 }
      )
    }

    // Stream the response
    const { stream } = await streamChat({ question, documentId, chatId })

    // Return streaming response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)

    // Check for rate limiting
    if (
      error instanceof Error &&
      error.message.includes('429')
    ) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment and try again.' },
        { status: 429 }
      )
    }

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
