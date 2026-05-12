export interface ShowcaseSnippet {
  title: string
  concept: string
  description: string
  filePath: string
  code: string
  language: 'tsx' | 'ts'
}

export const snippets: ShowcaseSnippet[] = [
  {
    title: 'Custom Hook — useChat with Input Validation',
    concept: 'useState, useCallback, useRef, AbortController, error handling, validation',
    description:
      'Manages chat state with streaming, validation, and localStorage persistence. Demonstrates input validation, error handling for quota exceeded, useRef for AbortController, and useCallback for memoized callbacks. Includes automatic caching to localStorage and fallback to API.',
    filePath: 'src/hooks/useChat.ts',
    language: 'ts',
    code: `const sendMessage = useCallback(
  async (question: string, documentId: string, chatId: string) => {
    try {
      // Validate input
      const trimmedQuestion = question.trim()
      if (!trimmedQuestion) {
        setError('Message cannot be empty')
        return
      }
      if (trimmedQuestion.length > 5000) {
        setError('Message cannot exceed 5000 characters')
        return
      }

      setError(null)
      setIsStreaming(true)
      setStreamingContent('')
      streamingContentRef.current = ''

      const userMessage: Message = {
        id: Math.random().toString(),
        chat_id: chatId,
        role: 'user',
        content: trimmedQuestion,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmedQuestion, documentId, chatId }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Chat failed')
      }
    } finally {
      setIsStreaming(false)
    }
  },
  []
)`,
  },

  {
    title: 'localStorage with Quota Error Handling',
    concept: 'useEffect side effects, try-catch error handling, QuotaExceededError',
    description:
      'Automatically persists chat messages to localStorage whenever they change. Gracefully handles QuotaExceededError when storage is full, providing user feedback instead of silent failures.',
    filePath: 'src/hooks/useChat.ts',
    language: 'ts',
    code: `// Save messages to localStorage whenever they change
useEffect(() => {
  if (chatIdRef.current && messages.length > 0) {
    try {
      localStorage.setItem(\`chat_\${chatIdRef.current}\`, JSON.stringify(messages))
    } catch (err) {
      // Handle quota exceeded error gracefully
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, chat will not be cached')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError('Chat cache full. Your messages may not persist across sessions.')
      } else {
        console.error('Failed to save chat to localStorage:', err)
      }
    }
  }
}, [messages])

// Load messages from cache on mount, fallback to API
const loadMessages = useCallback(async (chatId: string) => {
  try {
    setIsLoading(true)
    setError(null)
    chatIdRef.current = chatId

    // Check for cached messages in localStorage first
    const cachedMessages = localStorage.getItem(\`chat_\${chatId}\`)
    if (cachedMessages) {
      try {
        const parsedMessages = JSON.parse(cachedMessages)
        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages)
          setIsLoading(false)
          return
        }
      } catch {
        // Continue with API fetch if cache is invalid
      }
    }

    const response = await fetch(\`/api/chat/\${chatId}/messages\`)
    if (!response.ok) throw new Error('Failed to load messages')
    
    const data = await response.json()
    setMessages(Array.isArray(data) ? data : [])
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load messages')
  } finally {
    setIsLoading(false)
  }
}, [])`,
  },

  {
    title: 'Error Boundary — Class Component',
    concept: 'React.Component, getDerivedStateFromError, componentDidCatch',
    description:
      'Catches rendering errors in child components using React lifecycle methods. Demonstrates the class component pattern for error handling.',
    filePath: 'src/components/ErrorBoundary.tsx',
    language: 'tsx',
    code: `export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}`,
  },

  {
    title: 'Chat Rendering with Scrollbar Styling',
    concept: 'useEffect auto-scroll, ref forwarding, custom scrollbar CSS, react-markdown',
    description:
      'Renders scrollable chat messages with visible custom scrollbars (hidden by default in scroll containers). Auto-scrolls to latest message on update. Supports markdown rendering for assistant responses and handles loading/streaming states.',
    filePath: 'src/features/chat/ChatWindow.tsx',
    language: 'tsx',
    code: `export function ChatWindow({
  messages,
  isLoading,
  streamingContent,
  isStreaming,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingContent])

  return (
    <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(156_163_175)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full dark:[scrollbar-color:rgb(55_65_81)_transparent] dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
      <div className="p-6 space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-12 w-3/4" />
          </>
        ) : messages.length === 0 ? (
          <p className="text-gray-500">No messages yet</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              {message.role === 'assistant' ? (
                <div className="max-w-2xl prose prose-sm dark:prose-invert">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {message.content}
                </p>
              )}
            </div>
          ))
        )}

        {isStreaming && streamingContent && (
          <div className="flex gap-3">
            <div className="max-w-2xl prose prose-sm dark:prose-invert">
              <ReactMarkdown>{streamingContent}</ReactMarkdown>
              <span className="inline-block w-2 h-5 ml-1 bg-gray-600 dark:bg-gray-400 animate-pulse" />
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>
    </div>
  )
}`,
  },

  {
    title: 'Document Selector with Data Fetching',
    concept: 'useEffect for data fetching, controlled components, async callbacks',
    description:
      'Fetches documents on mount and creates a new chat when a document is selected. Demonstrates useEffect for initial data loading and handling async operations in event handlers.',
    filePath: 'src/features/chat/DocumentSelector.tsx',
    language: 'tsx',
    code: `export function DocumentSelector({
  onDocumentSelected,
  onUploadClick,
  isLoading,
}: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setDocuments(data || [])
      } catch (err) {
        console.error('Failed to fetch documents:', err)
      } finally {
        setIsFetching(false)
      }
    }

    fetchDocuments()
  }, [])

  const handleSelectDocument = (docId: string | null) => {
    if (!docId) return

    const doc = documents.find((d) => d.id === docId)
    if (!doc) return

    ;(async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: chatData, error } = await supabase
        .from('chats')
        .insert({
          title: 'New Chat',
          document_id: docId,
          saved: false,
        })
        .select('id')
        .single()

      if (error || !chatData) return

      await onDocumentSelected(docId, doc.filename, chatData.id)
    })()
  }
}`,
  },

  {
    title: 'Custom Theme Provider — No Script Injection',
    concept: 'React Context, useEffect, matchMedia API, localStorage persistence',
    description:
      'Custom theme provider that replaces next-themes, eliminating script injection errors during SSR. Uses Context API to manage theme state, detects system preferences via matchMedia, and persists to localStorage. Provides default context values to prevent undefined access errors.',
    filePath: 'src/components/ThemeProvider.tsx',
    language: 'tsx',
    code: `type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
})

export function NextThemesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme') as Theme | null
    const initialTheme = storedTheme || 'system'

    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (initialTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initialTheme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (initialTheme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('app-theme', newTheme)
    setThemeState(newTheme)

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within NextThemesProvider')
  }
  return context
}`,
  },

  {
    title: 'Hydration-Safe State Restoration',
    concept: 'useState deferred initialization, useEffect for client-only state, mounted gate',
    description:
      'Restores application state from localStorage only after hydration completes. Uses a mounted flag to ensure server-rendered HTML matches client-rendered HTML during hydration. Prevents hydration mismatches by deferring localStorage access to useEffect.',
    filePath: 'src/app/page.tsx',
    language: 'tsx',
    code: `export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'saved'>('chat')
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [activeDocumentName, setActiveDocumentName] = useState<string | null>(null)

  // Restore state from localStorage after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveChatId(localStorage.getItem('activeChatId'))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveDocumentId(localStorage.getItem('activeDocumentId'))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveDocumentName(localStorage.getItem('activeDocumentName'))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Only render conditional content after hydration
  return (
    <ErrorBoundary>
      <div className="w-full h-full flex flex-col min-h-0">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          {/* ... tabs ... */}
        </div>

        {/* Action Buttons - gated by mounted flag */}
        {mounted && activeTab === 'chat' && activeChatId && (
          <div className="flex gap-2">
            <Button onClick={handleClearHistory} disabled={messages.length === 0}>
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
            <Button onClick={handleSaveChat} disabled={isSaved || isStreaming}>
              <Save className="h-4 w-4" />
              {isSaved ? 'Saved ✓' : 'Save Chat'}
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}`,
  },

  {
    title: 'Dark Mode Toggle with Custom Context',
    concept: 'useContext, custom hook pattern, conditional rendering',
    description:
      'Simple dark mode toggle using custom useTheme hook. Accessed from a client-side Sidebar component to ensure proper context scope. No external library dependencies or SSR script injection issues.',
    filePath: 'src/components/DarkModeToggle.tsx',
    language: 'tsx',
    code: `export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      variant="ghost"
      size="sm"
      className="w-full justify-start px-2 py-1 h-auto text-sm"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4 mr-2" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 mr-2" />
          Dark Mode
        </>
      )}
    </Button>
  )
}`,
  },

  {
    title: 'Text Input with Keyboard Handling',
    concept: 'useState for controlled input, onKeyDown handlers, dynamic button states',
    description:
      'Textarea component that handles Enter to send, Shift+Enter for newline, and auto-resize. Shows dynamic button states based on loading/streaming flags.',
    filePath: 'src/features/chat/MessageInput.tsx',
    language: 'tsx',
    code: `export function MessageInput({
  onSendMessage,
  isLoading,
  isStreaming,
  onAbort,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (message.trim() && !isLoading && !isStreaming) {
      onSendMessage(message)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 120)
      textareaRef.current.style.height = nextHeight + 'px'
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-950">
      <div className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isStreaming}
          rows={1}
        />
        {isStreaming ? (
          <Button
            onClick={onAbort}
            variant="destructive"
            size="icon"
            className="h-10 w-10"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size="icon"
            className="h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}`,
  },

  {
    title: 'Error Boundary — Class Component Error Handling',
    concept: 'React.Component, getDerivedStateFromError, componentDidCatch, error recovery UI',
    description:
      'Wraps child components to catch runtime errors. Implements both getDerivedStateFromError for state updates and componentDidCatch for logging. Displays user-friendly error UI with page refresh option.',
    filePath: 'src/components/ErrorBoundary.tsx',
    language: 'tsx',
    code: `export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-white dark:bg-gray-950">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}`,
  },

  {
    title: 'Environment Validation — Startup Checks',
    concept: 'Build-time validation, error handling, process.env access',
    description:
      'Validates all required environment variables at application startup before server runs. Includes format validation for API keys and URLs. Fails fast with helpful error messages to catch configuration issues early.',
    filePath: 'src/lib/utils/validateEnv.ts',
    language: 'ts',
    code: `export function validateEnvironment(): void {
  const required = [
    'OPENAI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing: string[] = []
  const invalid: string[] = []

  for (const key of required) {
    const value = process.env[key]

    if (!value) {
      missing.push(key)
      continue
    }

    // Basic validation for specific vars
    if (key === 'OPENAI_API_KEY' && !value.startsWith('sk-')) {
      invalid.push(\`\${key} appears to be invalid (should start with 'sk-')\`)
    }

    if ((key === 'SUPABASE_URL' || key === 'NEXT_PUBLIC_SUPABASE_URL') && 
        !value.startsWith('https://')) {
      invalid.push(\`\${key} should be a valid HTTPS URL\`)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      \`Missing required environment variables:\\n\${missing.map((k) => \`  - \${k}\`).join('\\n')}\`
    )
  }

  if (invalid.length > 0) {
    throw new Error(
      \`Invalid environment variables:\\n\${invalid.map((k) => \`  - \${k}\`).join('\\n')}\`
    )
  }
}`,
  },

  {
    title: 'Saved Chat Management — Delete with Confirmation',
    concept: 'Async operations, user confirmation, state updates, API calls',
    description:
      'Manages saved chat operations including deletion with user confirmation dialog. Demonstrates optimistic UI updates and error handling for API failures.',
    filePath: 'src/features/saved/SavedChatList.tsx',
    language: 'tsx',
    code: `export function SavedChatList({ chats, onSelectChat }: SavedChatListProps) {
  const [chatList, setChatList] = useState(chats)

  const handleDeleteChat = async (
    chatId: string,
    chatTitle: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()

    if (!window.confirm(\`Delete "\${chatTitle}"? This cannot be undone.\`)) {
      return
    }

    try {
      const response = await fetch(\`/api/saved/\${chatId}\`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete chat')
      }

      // Optimistic update
      setChatList((prev) => prev.filter((chat) => chat.id !== chatId))
      alert('Chat deleted successfully')
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete chat')
    }
  }

  return (
    <div className="space-y-3">
      {chatList.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onSelectChat(chat.id, chat)}
          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center"
        >
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {chat.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {chat.documents.filename}
            </p>
          </div>
          <Button
            onClick={(e) => handleDeleteChat(chat.id, chat.title, e)}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}`,
  },
]

