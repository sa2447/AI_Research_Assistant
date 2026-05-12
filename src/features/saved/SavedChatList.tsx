'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, FileText, Trash2 } from 'lucide-react'

interface SavedChat {
  id: string
  title: string
  created_at: string
  documents: { filename: string }
}

interface SavedChatListProps {
  onSelectChat: (chatId: string, chat: SavedChat) => void
}

export function SavedChatList({ onSelectChat }: SavedChatListProps) {
  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSavedChats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/saved')
        if (!response.ok) {
          throw new Error('Failed to fetch saved chats')
        }

        const data = await response.json()
        setSavedChats(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load saved chats'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavedChats()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDeleteChat = async (chatId: string, chatTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Delete chat "${chatTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/saved/${chatId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete chat')
      }

      setSavedChats((current) => current.filter((chat) => chat.id !== chatId))
      alert('Chat deleted successfully')
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete chat')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1">
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (savedChats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No saved chats yet.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Save a chat session from the Chat tab to see it here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="space-y-3">
        {savedChats.map((chat) => (
          <Card
            key={chat.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectChat(chat.id, chat)}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 break-words">
                    {chat.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {chat.documents?.filename || 'Unknown Document'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(chat.created_at)}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={(e) => handleDeleteChat(chat.id, chat.title, e)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
