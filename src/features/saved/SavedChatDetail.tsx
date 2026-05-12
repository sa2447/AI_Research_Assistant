'use client'

import { useEffect, useState } from 'react'
import { Message } from '@/types/database'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface SavedChat {
  id: string
  title: string
  created_at: string
  documents: { filename: string }
}

interface SavedChatDetailProps {
  chatId: string
  chat: SavedChat
  onBack: () => void
}

export function SavedChatDetail({
  chatId,
  chat,
  onBack,
}: SavedChatDetailProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/saved/${chatId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch messages')
        }

        const data = await response.json()
        setMessages(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load messages'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [chatId])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-3 mb-2">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 break-words">
              {chat.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {chat.documents?.filename || 'Unknown Document'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {isLoading ? (
        <div className="flex-1 p-6 space-y-4 overflow-auto">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-12 w-3/4 mb-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {messages.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No messages in this chat.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xl px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p className="text-xs mt-2 opacity-70">
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
