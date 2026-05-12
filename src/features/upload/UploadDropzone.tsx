'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, AlertCircle, CheckCircle } from 'lucide-react'

interface UploadData {
  documentId: string
  filename: string
  storagePath: string
  pageCount: number
  rawText: string
}

interface UploadDropzoneProps {
  onUploadComplete: (data: UploadData) => Promise<void>
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'processing' | 'success' | 'error'

async function getApiErrorMessage(response: Response, fallbackMessage: string) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    try {
      const data = (await response.json()) as { error?: unknown }
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error
      }
    } catch {
      // Fall through to plain text parsing.
    }
  }

  const text = await response.text()
  const cleaned = text.trim()

  if (cleaned.length > 0) {
    return cleaned.length > 250 ? `${cleaned.slice(0, 250)}...` : cleaned
  }

  return fallbackMessage
}

export function UploadDropzone({ onUploadComplete }: UploadDropzoneProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [filename, setFilename] = useState<string>('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setFilename(file.name)

      // Validate
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are accepted')
        setState('error')
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB')
        setState('error')
        return
      }

      setState('uploading')
      setError(null)
      setProgress(0)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const message = await getApiErrorMessage(response, 'Upload failed')
          throw new Error(message)
        }

        let uploadData: UploadData
        try {
          uploadData = (await response.json()) as UploadData
        } catch {
          throw new Error('Upload returned an invalid response format')
        }
        setProgress(50)

        // Process embeddings
        setState('processing')

        const embeddingsResponse = await fetch('/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: uploadData.documentId,
            rawText: uploadData.rawText,
            pageCount: uploadData.pageCount,
          }),
        })

        if (!embeddingsResponse.ok) {
          const message = await getApiErrorMessage(embeddingsResponse, 'Embedding failed')
          throw new Error(message)
        }

        setProgress(100)
        setState('success')

        // Call parent handler
        await onUploadComplete(uploadData)

        // Reset after 2 seconds
        setTimeout(() => {
          setState('idle')
          setProgress(0)
          setFilename('')
        }, 2000)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        setState('error')
      }
    },
    [onUploadComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
  })

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />

        {state === 'idle' && (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isDragActive ? 'Drop PDF here' : 'Drag and drop a PDF'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to select (max 50MB)
            </p>
          </>
        )}

        {state === 'uploading' && (
          <>
            <div className="mb-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uploading {filename}...
            </p>
          </>
        )}

        {state === 'processing' && (
          <>
            <div className="mb-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processing document for AI analysis...
            </p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium text-green-600 dark:text-green-400">
              Upload successful!
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
              Upload failed
            </p>
            <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
          </>
        )}
      </div>
    </div>
  )
}
