export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  platform: 'chatgpt' | 'claude' | 'gemini' | 'copilot' | 'perplexity' | 'grok' | 'deepseek'
  platformConversationId: string
  title: string
  url: string
  messages: Message[]
  firstMessageAt: number
  lastMessageAt: number
  capturedAt: number
  isBookmarked: boolean
  tags: string[]
}

export interface SearchResult {
  conversation: Conversation
  matchedMessage: Message
  snippet: string
  highlightRanges: [number, number][]
}

export type BackgroundMessage =
  | { type: 'SAVE_CONVERSATION'; conversation: Omit<Conversation, 'id' | 'capturedAt'> }
  | { type: 'TOGGLE_BOOKMARK_BY_URL'; url: string }
  | { type: 'CLEANUP_OLD' }
  | { type: 'CLEAR_ALL_DATA' }
