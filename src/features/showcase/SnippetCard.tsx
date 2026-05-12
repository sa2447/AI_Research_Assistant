'use client'

import { ShowcaseSnippet } from './snippets'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Card } from '@/components/ui/card'

interface SnippetCardProps {
  snippet: ShowcaseSnippet
}

export function SnippetCard({ snippet }: SnippetCardProps) {
  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-900">
      <div className="p-6 md:p-8">
        {/* Title */}
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          {snippet.title}
        </h3>

        {/* Concepts */}
        <div className="mb-3">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
            {snippet.concept}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-base leading-7">
          {snippet.description}
        </p>

        {/* File Path */}
        <div className="text-sm text-gray-500 dark:text-gray-500 font-mono mb-4 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
          {snippet.filePath}
        </div>

        {/* Code Block */}
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language={snippet.language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              lineHeight: '1.5',
            }}
            showLineNumbers={false}
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>
      </div>
    </Card>
  )
}
