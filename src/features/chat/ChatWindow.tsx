'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/types/database'
import { Skeleton } from '@/components/ui/skeleton'
import ReactMarkdown from 'react-markdown'

interface ChatWindowProps {
  messages: Message[]
  isLoading: boolean
  streamingContent: string
  isStreaming: boolean
}

export function ChatWindow({
  messages,
  isLoading,
  streamingContent,
  isStreaming,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingContent])

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden bg-white dark:bg-gray-950 flex flex-col">
        <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(156_163_175)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full dark:[scrollbar-color:rgb(55_65_81)_transparent] dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden bg-white dark:bg-gray-950 flex flex-col">
      <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(156_163_175)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full dark:[scrollbar-color:rgb(55_65_81)_transparent] dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
        <div className="p-6 space-y-4">
          {messages.length === 0 && !isStreaming && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Ask a question to get started</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
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
                <p
                  className={`text-xs mt-1 ${
                    message.role === 'user'
                      ? 'text-blue-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-xl px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>
                    {streamingContent}
                  </ReactMarkdown>
                </div>
                <span className="inline-block w-2 h-5 ml-1 bg-gray-600 dark:bg-gray-400 rounded animate-pulse" />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>
    </div>
  )
}
