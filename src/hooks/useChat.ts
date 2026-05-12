'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Message } from '@/types/database'

export interface UseChatReturn {
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  streamingContent: string
  error: string | null
  sendMessage: (question: string, documentId: string, chatId: string) => Promise<void>
  loadMessages: (chatId: string) => Promise<void>
  abortGeneration: () => void
  resetMessages: () => void
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const streamingContentRef = useRef('')
  const chatIdRef = useRef<string | null>(null)

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (chatIdRef.current && messages.length > 0) {
      try {
        localStorage.setItem(`chat_${chatIdRef.current}`, JSON.stringify(messages))
      } catch (err) {
        // Handle quota exceeded error gracefully
        if (err instanceof Error && err.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, chat will not be cached')
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setError('Chat cache full. Your messages may not persist across sessions.')
        } else {
          console.error('Failed to save chat to localStorage:', err)
        }
      }
    }
  }, [messages])

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      chatIdRef.current = chatId

      // Check for cached messages in localStorage first
      const cachedMessages = localStorage.getItem(`chat_${chatId}`)
      if (cachedMessages) {
        try {
          const parsedMessages = JSON.parse(cachedMessages)
          if (Array.isArray(parsedMessages)) {
            setMessages(parsedMessages)
            setIsLoading(false)
            return
          }
        } catch {
          // Continue with API fetch if cache is invalid
        }
      }

      const response = await fetch(`/api/chat/${chatId}/messages`)
      if (!response.ok) {
        let message = 'Failed to load messages'
        try {
          const payload = await response.json()
          if (payload && typeof payload.error === 'string') {
            message = payload.error
          }
        } catch {
          // Ignore invalid JSON and keep fallback message
        }
        throw new Error(message)
      }

      const data = await response.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load messages'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (question: string, documentId: string, chatId: string) => {
      try {
        // Validate input
        const trimmedQuestion = question.trim()
        if (!trimmedQuestion) {
          setError('Message cannot be empty')
          return
        }
        if (trimmedQuestion.length > 5000) {
          setError('Message cannot exceed 5000 characters')
          return
        }

        setError(null)
        setIsStreaming(true)
        setStreamingContent('')
        streamingContentRef.current = ''

        // Add user message immediately
        const userMessage: Message = {
          id: Math.random().toString(),
          chat_id: chatId,
          role: 'user',
          content: trimmedQuestion,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, userMessage])

        // Abort previous stream if any
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        // Stream response
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: trimmedQuestion, documentId, chatId }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Chat failed')
        }

        if (!response.body) throw new Error('No response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Parse complete messages from buffer
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue

            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.token) {
                streamingContentRef.current += parsed.token
                setStreamingContent(streamingContentRef.current)
              }
            } catch {
              // Ignore JSON parse errors
            }
          }
        }

        // Final decode
        buffer += decoder.decode()

        // Create assistant message with full response
        const assistantMessage: Message = {
          id: Math.random().toString(),
          chat_id: chatId,
          role: 'assistant',
          content: streamingContentRef.current,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setStreamingContent('')
        streamingContentRef.current = ''
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Stream was aborted, don't treat as error
          return
        }
        setError(
          err instanceof Error ? err.message : 'Failed to send message'
        )
      } finally {
        setIsStreaming(false)
      }
    },
    []
  )

  const abortGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsStreaming(false)
  }, [])

  const resetMessages = useCallback(() => {
    setMessages([])
    setIsLoading(false)
    setIsStreaming(false)
    setStreamingContent('')
    setError(null)
    streamingContentRef.current = ''
    if (chatIdRef.current) {
      localStorage.removeItem(`chat_${chatIdRef.current}`)
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  return {
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    loadMessages,
    abortGeneration,
    resetMessages,
  }
}
