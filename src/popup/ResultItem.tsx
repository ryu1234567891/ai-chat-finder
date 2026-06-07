import type { SearchResult } from '../types'
import { formatDate } from '../utils/date'
import { PLATFORM_BADGE } from '../utils/platform'

interface Props {
  result: SearchResult
  onOpen: (url: string) => void
  onDelete: (id: string) => void
  isSelected?: boolean
}

function HighlightedText({
  text,
  ranges,
}: {
  text: string
  ranges: [number, number][]
}) {
  if (ranges.length === 0) return <>{text}</>

  const parts: React.ReactNode[] = []
  let last = 0

  for (const [start, end] of ranges) {
    if (start > last) parts.push(<span key={`t-${last}`}>{text.slice(last, start)}</span>)
    parts.push(
      <mark key={`h-${start}`} className="bg-yellow-200 rounded-sm">
        {text.slice(start, end)}
      </mark>
    )
    last = end
  }

  if (last < text.length) parts.push(<span key={`t-${last}`}>{text.slice(last)}</span>)

  return <>{parts}</>
}

export default function ResultItem({ result, onOpen, onDelete, isSelected }: Props) {
  const { conversation, snippet, highlightRanges } = result
  const badge = PLATFORM_BADGE[conversation.platform] ?? { label: conversation.platform, className: 'bg-gray-100 text-gray-700' }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(conversation.url)
    }
  }

  return (
    <div
      role="listitem"
    >
      <div
        role="button"
        tabIndex={0}
        className={`group px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}
        onClick={() => onOpen(conversation.url)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${badge.className}`}>
            {badge.label}
          </span>
          <span className="text-sm font-medium text-gray-800 truncate flex-1">
            {conversation.title}
          </span>
          <span className="shrink-0 text-xs text-gray-400">{formatDate(conversation.lastMessageAt)}</span>
          <button
            className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all ml-1"
            onClick={e => { e.stopPropagation(); onDelete(conversation.id) }}
            title="削除"
            aria-label="この会話を削除"
          >
            ✕
          </button>
        </div>
        <div className="text-xs text-gray-600 leading-relaxed">
          <HighlightedText text={snippet} ranges={highlightRanges} />
        </div>
      </div>
    </div>
  )
}
