'use client'

import { snippets } from '@/features/showcase/snippets'
import { SnippetCard } from '@/features/showcase/SnippetCard'

export default function ShowcasePage() {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            React in Action
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            Annotated code snippets from the AI Research Assistant project
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="mb-12 prose prose-base dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-8">
            This showcase demonstrates React patterns and best practices used throughout the AI
            Research Assistant application. Each snippet is taken directly from the production
            codebase and includes explanations of the React concepts involved.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-8 mt-4">
            Topics covered include state management, custom hooks, async operations, streaming,
            error boundaries, and integration with external libraries like Next.js, Supabase,
            and react-markdown.
          </p>
        </div>

        {/* Snippets Grid */}
        <div className="space-y-8">
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.title} snippet={snippet} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center text-base text-gray-600 dark:text-gray-400">
            <p className="font-semibold mb-2">AI Research Assistant</p>
            <p>
              Built with React 19 • Next.js 16 • TypeScript • Tailwind CSS • Supabase • OpenAI
            </p>
            <p className="mt-4 text-xs">
              This is a demonstration project showcasing modern React development patterns.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
