'use client'

import Link from 'next/link'
import { DarkModeToggle } from '@/components/DarkModeToggle'

export function Sidebar() {
  return (
    <aside className="w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col p-5 overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">Research Assistant</h1>
      </div>
      <nav className="space-y-4 flex-1 text-base">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 px-2">
            Navigation
          </p>
          <Link
            href="/"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Active Chat
          </Link>
          <Link
            href="/documents"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Documents
          </Link>
          <Link
            href="/showcase"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            React Showcase
          </Link>
        </div>
      </nav>
      <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 px-2">
          Settings
        </p>
        <DarkModeToggle />
      </div>
    </aside>
  )
}
