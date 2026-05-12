'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@/hooks/useChat'
import { ChatWindow } from '@/features/chat/ChatWindow'
import { MessageInput } from '@/features/chat/MessageInput'
import { DocumentSelector } from '@/features/chat/DocumentSelector'
import { UploadDropzone } from '@/features/upload/UploadDropzone'
import { SavedChatList } from '@/features/saved/SavedChatList'
import { SavedChatDetail } from '@/features/saved/SavedChatDetail'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Save, Trash2 } from 'lucide-react'

interface SavedChat {
  id: string
  title: string
  created_at: string
  documents: { filename: string }
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'saved'>('chat')
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [activeDocumentName, setActiveDocumentName] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [showUploadDropzone, setShowUploadDropzone] = useState(false)
  const [selectedSavedChatId, setSelectedSavedChatId] = useState<
    string | null
  >(null)
  const [selectedSavedChat, setSelectedSavedChat] = useState<SavedChat | null>(
    null
  )
  const restoredRef = useRef(false)

  const {
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    loadMessages,
    abortGeneration,
    resetMessages,
  } = useChat()

  // Restore state from localStorage after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveChatId(localStorage.getItem('activeChatId'))
     
    setActiveDocumentId(localStorage.getItem('activeDocumentId'))
     
    setActiveDocumentName(localStorage.getItem('activeDocumentName'))
     
    setMounted(true)
  }, [])

  // Load messages from cache on mount or when activeChatId changes
  useEffect(() => {
    if (activeChatId && restoredRef.current === false) {
      restoredRef.current = true
      loadMessages(activeChatId)
    }
  }, [activeChatId, loadMessages])

  // Save active document and chat to localStorage
  useEffect(() => {
    if (activeDocumentId && activeDocumentName && activeChatId) {
      localStorage.setItem('activeDocumentId', activeDocumentId)
      localStorage.setItem('activeDocumentName', activeDocumentName)
      localStorage.setItem('activeChatId', activeChatId)
    }
  }, [activeDocumentId, activeDocumentName, activeChatId])

  const handleDocumentSelected = async (
    documentId: string,
    documentName: string,
    chatId: string
  ) => {
    setActiveDocumentId(documentId)
    setActiveDocumentName(documentName)
    setActiveChatId(chatId)
    setIsSaved(false)
    await loadMessages(chatId)
  }

  const handleSendMessage = async (question: string) => {
    if (!activeChatId || !activeDocumentId) return
    await sendMessage(question, activeDocumentId, activeChatId)
  }

  const handleSaveChat = async () => {
    if (!activeChatId) return

    try {
      // Prompt user for chat title
      const title = window.prompt('Enter a name for this chat:')
      if (title === null) return // User cancelled

      const response = await fetch(`/api/chat/${activeChatId}/save`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() || `Chat from ${new Date().toLocaleDateString()}` }),
      })

      if (!response.ok) {
        throw new Error('Failed to save chat')
      }

      setIsSaved(true)
      alert('Chat saved successfully!')
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save chat')
    }
  }

  const handleUploadComplete = async () => {
    setShowUploadDropzone(false)
  }

  const handleDocumentDeleted = () => {
    setActiveDocumentId(null)
    setActiveDocumentName(null)
    setActiveChatId(null)
    setIsSaved(false)
    resetMessages()
  }

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
      resetMessages()
    }
  }

  const handleSelectSavedChat = (chatId: string, chat: SavedChat) => {
    setSelectedSavedChatId(chatId)
    setSelectedSavedChat(chat)
  }

  const handleBackToSavedList = () => {
    setSelectedSavedChatId(null)
    setSelectedSavedChat(null)
  }

  return (
    <ErrorBoundary>
      <div className="w-full h-full flex flex-col min-h-0">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex px-6 py-4 justify-between items-center">
            <div className="flex text-base">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 font-semibold border-b-2 ${
                  activeTab === 'chat'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 font-semibold border-b-2 ml-4 ${
                  activeTab === 'saved'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Saved
              </button>
            </div>

            {/* Action Buttons */}
            {mounted && activeTab === 'chat' && activeChatId && (
              <div className="flex gap-2">
                <Button
                  onClick={handleClearHistory}
                  disabled={messages.length === 0}
                  variant="outline"
                  size="sm"
                  className="flex gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear History
                </Button>
                <Button
                  onClick={handleSaveChat}
                  disabled={isSaved || isStreaming}
                  variant={isSaved ? 'outline' : 'default'}
                  size="sm"
                  className="flex gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaved ? 'Saved ✓' : 'Save Chat'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {showUploadDropzone ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-950">
                <div className="mb-8">
                  <h2 className="text-4xl font-bold tracking-tight text-center mb-4">
                    Upload a Document
                  </h2>
                  <p className="text-base text-gray-600 dark:text-gray-400 text-center mb-6">
                    Upload a PDF to analyze and ask questions about it. Files up to 50MB are supported.
                  </p>
                </div>
                <UploadDropzone
                  onUploadComplete={handleUploadComplete}
                />
                <Button
                  onClick={() => setShowUploadDropzone(false)}
                  variant="outline"
                  className="mt-6"
                >
                  Cancel
                </Button>
              </div>
            ) : activeDocumentId ? (
              <>
                <DocumentSelector
                  onDocumentSelected={handleDocumentSelected}
                  onDocumentDeleted={handleDocumentDeleted}
                  onUploadClick={() => setShowUploadDropzone(true)}
                  isLoading={isLoading}
                />

                {/* Active Document Header */}
                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-800">
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Analyzing:{' '}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {activeDocumentName}
                    </span>
                  </p>
                </div>

                <ErrorBoundary>
                  <ChatWindow
                    messages={messages}
                    isLoading={isLoading}
                    streamingContent={streamingContent}
                    isStreaming={isStreaming}
                  />
                </ErrorBoundary>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 px-6 py-3">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Error: {error}
                    </p>
                  </div>
                )}

                <MessageInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  isStreaming={isStreaming}
                  onAbort={abortGeneration}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
                <div className="text-center mb-8 pt-8">
                  <h2 className="text-4xl font-bold tracking-tight mb-4">
                    Get Started
                  </h2>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Select a document or upload a new one to begin
                  </p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <DocumentSelector
                    onDocumentSelected={handleDocumentSelected}
                    onDocumentDeleted={handleDocumentDeleted}
                    onUploadClick={() => setShowUploadDropzone(true)}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div className="flex-1 flex overflow-hidden">
            <ErrorBoundary>
              {selectedSavedChatId && selectedSavedChat ? (
                <SavedChatDetail
                  chatId={selectedSavedChatId}
                  chat={selectedSavedChat}
                  onBack={handleBackToSavedList}
                />
              ) : (
                <SavedChatList onSelectChat={handleSelectSavedChat} />
              )}
            </ErrorBoundary>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
