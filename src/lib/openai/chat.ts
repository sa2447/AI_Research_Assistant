import { openai } from './client'
import { retrieveContext } from '@/lib/retrieval/retrieveContext'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface ChatOptions {
  question: string
  documentId: string
  chatId: string
}

export interface ChatStreamToken {
  token: string
}

const systemPrompt = `
You are a precise research assistant. Your goal is to provide accurate, consistent answers based ONLY on the provided document context.

IMPORTANT RULES:
1. Use ONLY information from the context provided - never use outside knowledge
2. Be thorough and cite multiple relevant passages to support your answer
3. If asked about quantities, counts, or specific data, verify the information appears in the context
4. Provide consistent answers - if the same information appears in multiple places in the context, acknowledge it
5. Format citations exactly as: *Citation: [Page N: "exact quote from context"]*
6. If the context lacks sufficient information to answer accurately, clearly state this
7. When relevant, quote directly from the document to ensure accuracy
`.trim()

export async function streamChat(
  options: ChatOptions
): Promise<{ stream: ReadableStream<string>; fullResponse: string }> {
  const { question, documentId, chatId } = options

  // Retrieve context
  const { contextBlock } = await retrieveContext(question, documentId)

  // Build user message
  const userMessage = `CONTEXT:
${contextBlock}

QUESTION:
${question}`

  // Create streaming completion
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    stream: true,
    temperature: 0.2,
  })

  // Collect full response for persistence
  let fullResponse = ''

  // Create readable stream for client consumption
  const readableStream = new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content || ''
          if (token) {
            fullResponse += token
            controller.enqueue(`data: ${JSON.stringify({ token })}\n`)
          }
        }

        controller.enqueue('data: [DONE]\n')
        controller.close()

        // Persist messages after streaming completes
        try {
          const supabase = createServerSupabaseClient()
          await supabase.from('messages').insert([
            { chat_id: chatId, role: 'user', content: question },
            {
              chat_id: chatId,
              role: 'assistant',
              content: fullResponse,
            },
          ])
        } catch (err) {
          console.error('Error persisting messages:', err)
          // Don't throw — stream already started
        }
      } catch (err) {
        console.error('Stream error:', err)
        controller.error(err)
      }
    },
  })

  return { stream: readableStream, fullResponse }
}
