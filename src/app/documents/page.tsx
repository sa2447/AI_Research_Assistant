'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Document } from '@/types/database'
import { ArrowLeft, Trash2, Upload } from 'lucide-react'

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch('/api/documents')
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || 'Failed to load documents')
        }

        const data = await response.json()
        setDocuments(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents')
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [])

  const handleDelete = async (documentId: string, filename: string) => {
    if (!window.confirm(`Delete ${filename}? This removes the PDF and its related data.`)) {
      return
    }

    try {
      setDeletingId(documentId)
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || 'Failed to delete document')
      }

      setDocuments((current) => current.filter((item) => item.id !== documentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to chat
            </Link>
            <h1 className="text-4xl font-bold tracking-tight">Documents</h1>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400 max-w-2xl">
              View uploaded PDFs, inspect when they were added, and remove anything you no longer need.
            </p>
          </div>
          <Button onClick={() => router.push('/')} variant="default" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload PDF
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <CardHeader className="border-b border-gray-200/80 dark:border-gray-800/80">
            <CardTitle className="text-xl">Uploaded files</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-base text-gray-600 dark:text-gray-400">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="p-6 text-base text-gray-600 dark:text-gray-400">
                No documents yet. Upload a PDF to get started.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold truncate">{doc.filename}</h2>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Uploaded {new Date(doc.created_at).toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-500 truncate">
                        {doc.storage_path}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.filename)}
                      disabled={deletingId === doc.id}
                      className="gap-2 self-start md:self-center"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}