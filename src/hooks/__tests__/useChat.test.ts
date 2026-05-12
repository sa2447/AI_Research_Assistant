import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'
import { Message } from '@/types/database'

describe('useChat', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('sets an error for empty messages and does not call fetch', async () => {
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('   ', 'doc-1', 'chat-1')
    })

    expect(result.current.error).toBe('Message cannot be empty')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('sets an error for messages over 5000 chars and does not call fetch', async () => {
    const { result } = renderHook(() => useChat())
    const tooLong = 'a'.repeat(5001)

    await act(async () => {
      await result.current.sendMessage(tooLong, 'doc-1', 'chat-1')
    })

    expect(result.current.error).toBe('Message cannot exceed 5000 characters')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('loads messages from localStorage cache before API', async () => {
    const cached: Message[] = [
      {
        id: 'm-1',
        chat_id: 'chat-1',
        role: 'user',
        content: 'hello',
        created_at: new Date().toISOString(),
      },
    ]
    localStorage.setItem('chat_chat-1', JSON.stringify(cached))

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.loadMessages('chat-1')
    })

    expect(result.current.messages).toEqual(cached)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('falls back to API when cache is missing', async () => {
    const apiData: Message[] = [
      {
        id: 'm-2',
        chat_id: 'chat-2',
        role: 'assistant',
        content: 'from api',
        created_at: new Date().toISOString(),
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => apiData,
    })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.loadMessages('chat-2')
    })

    await waitFor(() => {
      expect(result.current.messages).toEqual(apiData)
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/chat/chat-2/messages')
  })
})
