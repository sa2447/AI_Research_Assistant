'use client'

import { useEffect, useState } from 'react'
import { Document } from '@/types/database'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface DocumentSelectorProps {
  onDocumentSelected: (
    documentId: string,
    documentName: string,
    chatId: string
  ) => Promise<void>
  onDocumentDeleted?: (documentId: string) => void
  onUploadClick: () => void
  isLoading: boolean
}

export function DocumentSelector({
  onDocumentSelected,
  onDocumentDeleted,
  onUploadClick,
  isLoading,
}: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)

  const getErrorMessage = async (response: Response, fallback: string) => {
    try {
      const payload = await response.json()
      if (payload && typeof payload.error === 'string') {
        return payload.error
      }
    } catch {
      // Ignore non-JSON error bodies and use fallback
    }

    return fallback
  }

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents')
        if (!response.ok) {
          const message = await getErrorMessage(
            response,
            'Failed to fetch documents.'
          )
          throw new Error(message)
        }

        const data = await response.json()
        setDocuments(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch documents:',
          err instanceof Error ? err.message : String(err),
          err
        )
        setConfigError(
          err instanceof Error ? err.message : 'Failed to initialize document list.'
        )
      } finally {
        setIsFetching(false)
      }
    }

    fetchDocuments()
  }, [])

  const handleSelectDocument = (docId: string | null) => {
    if (!docId) return
    
    setSelectedDocId(docId)

    const doc = documents.find((d) => d.id === docId)
    if (!doc) return

    // Fire the async operation without awaiting
    ;(async () => {
      try {
        const response = await fetch('/api/chat/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: docId }),
        })

        if (!response.ok) {
          const message = await getErrorMessage(response, 'Failed to create chat.')
          throw new Error(message)
        }

        const payload = await response.json()
        if (!payload?.chatId || typeof payload.chatId !== 'string') {
          throw new Error('Failed to create chat')
        }

        await onDocumentSelected(docId, doc.filename, payload.chatId)
      } catch (err) {
        console.error('Failed to create chat:',
          err instanceof Error ? err.message : String(err),
          err
        )
        setSelectedDocId(null)
      }
    })()
  }

  const handleDeleteDocument = async () => {
    if (!selectedDocId) return

    const doc = documents.find((item) => item.id === selectedDocId)
    const confirmMessage = doc
      ? `Delete ${doc.filename}? This will remove the PDF and its saved data.`
      : 'Delete this document? This will remove the PDF and its saved data.'

    if (!window.confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/documents/${selectedDocId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          'Failed to delete document.'
        )
        throw new Error(message)
      }

      setDocuments((current) => current.filter((item) => item.id !== selectedDocId))
      setSelectedDocId(null)
      onDocumentDeleted?.(selectedDocId)
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-950 p-4">
      {configError && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{configError}</p>
      )}
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <Select
            value={selectedDocId || ''}
            onValueChange={handleSelectDocument}
            disabled={isFetching || isLoading || Boolean(configError)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a document..." />
            </SelectTrigger>
            <SelectContent>
              {documents.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.filename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleDeleteDocument}
          variant="outline"
          size="sm"
          disabled={!selectedDocId || isFetching || isLoading || Boolean(configError)}
          className="flex gap-2"
        >
          Remove
        </Button>
        <Button
          onClick={onUploadClick}
          variant="outline"
          size="sm"
          disabled={Boolean(configError)}
          className="flex gap-2"
        >
          <Plus className="h-4 w-4" />
          Upload
        </Button>
      </div>
    </div>
  )
}
