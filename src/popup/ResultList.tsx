import type { SearchResult, Conversation, Message } from '../types'
import ResultItem from './ResultItem'
import { formatDate } from '../utils/date'
import { PLATFORM_BADGE, PLATFORMS } from '../utils/platform'

interface Props {
  results: SearchResult[]
  recentConversations: Conversation[]
  isLoading: boolean
  query: string
  onOpen: (url: string) => void
  onDelete: (id: string) => void
  selectedIndex: number
}

function getFirstMessage(messages: Message[], role: 'user' | 'assistant', maxChars: number): string {
  const msg = messages.find(m => m.role === role)
  if (!msg?.content) return ''
  return msg.content.length > maxChars ? msg.content.slice(0, maxChars) + '…' : msg.content
}

function ConversationItem({
  conv,
  onOpen,
  onDelete,
  isSelected,
}: {
  conv: Conversation
  onOpen: (url: string) => void
  onDelete: (id: string) => void
  isSelected?: boolean
}) {
  const badge = PLATFORM_BADGE[conv.platform] ?? { label: conv.platform, className: 'bg-gray-100 text-gray-700' }
  const userPreview = getFirstMessage(conv.messages, 'user', 100)
  const assistantPreview = getFirstMessage(conv.messages, 'assistant', 150)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(conv.url)
    }
  }

  return (
    <div role="listitem">
      <div
        role="button"
        tabIndex={0}
        className={`group px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}
        onClick={() => onOpen(conv.url)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium ${badge.className}`}>
            {badge.label}
          </span>
          <span className="text-sm font-medium text-gray-800 truncate flex-1 min-w-0">
            {conv.title}
          </span>
          <span className="shrink-0 text-xs text-gray-400">{formatDate(conv.lastMessageAt)}</span>
          <button
            className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all ml-1"
            onClick={e => { e.stopPropagation(); onDelete(conv.id) }}
            title="削除"
            aria-label="この会話を削除"
          >
            ✕
          </button>
        </div>
        {userPreview && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            🗣 {userPreview}
          </p>
        )}
        {assistantPreview && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            🤖 {assistantPreview}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ResultList({ results, recentConversations, isLoading, query, onOpen, onDelete, selectedIndex }: Props) {
  if (!query.trim()) {
    if (recentConversations.length === 0) {
      return (
        <div className="p-6 text-sm text-gray-400 text-center leading-relaxed">
          <p className="mb-3">
            まだ会話が保存されていません。
            <br />
            Claude.ai や ChatGPT で会話すると自動保存されます。
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {PLATFORMS.map(platform => {
              const b = PLATFORM_BADGE[platform]
              return (
                <span key={platform} className={`text-xs px-2 py-0.5 rounded font-medium ${b.className}`}>
                  {b.label}
                </span>
              )
            })}
          </div>
        </div>
      )
    }
    return (
      <div>
        <div className="px-4 py-2 text-xs text-gray-400 border-b">
          最近の会話 ({recentConversations.length}件)
        </div>
        <div role="list">
          {recentConversations.map((conv, idx) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              onOpen={onOpen}
              onDelete={onDelete}
              isSelected={idx === selectedIndex}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div aria-live="polite" className="relative">
      {results.length > 0 && (
        <div className="px-4 py-2 text-xs text-gray-400 border-b">{results.length}件</div>
      )}

      {/* 既存結果: isLoading中は薄く表示 */}
      {results.length > 0 && (
        <div className={isLoading ? 'opacity-40 pointer-events-none' : ''} role="list">
          {results.map((result, idx) => (
            <ResultItem
              key={result.conversation.id}
              result={result}
              onOpen={onOpen}
              onDelete={onDelete}
              isSelected={idx === selectedIndex}
            />
          ))}
        </div>
      )}

      {/* ローディングスピナーオーバーレイ */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            検索中...
          </div>
        </div>
      )}

      {/* 初回ローディング（結果が0件の場合） */}
      {isLoading && results.length === 0 && (
        <div className="p-6 text-sm text-gray-500 text-center">検索中...</div>
      )}

      {/* 結果なし */}
      {!isLoading && results.length === 0 && (
        <div className="p-6 text-sm text-gray-500 text-center">
          「{query}」は見つかりませんでした
        </div>
      )}
    </div>
  )
}
