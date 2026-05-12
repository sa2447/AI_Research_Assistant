'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Square } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>
  isLoading: boolean
  isStreaming: boolean
  onAbort: () => void
}

export function MessageInput({
  onSendMessage,
  isLoading,
  isStreaming,
  onAbort,
}: MessageInputProps) {
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight,
        112
      ).toString() + 'px'
    }
  }, [input])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading || isStreaming || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSendMessage(input)
      setInput('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-4">
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          disabled={isLoading || isStreaming || isSubmitting}
          className="flex-1 resize-none px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
        />
        {isStreaming ? (
          <Button
            onClick={onAbort}
            variant="destructive"
            size="icon"
            className="h-12 w-12"
            title="Stop generation"
          >
            <Square className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading || isSubmitting}
            size="icon"
            className="h-12 w-12"
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
