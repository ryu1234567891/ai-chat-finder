import type { Conversation } from '../types'
import { formatDate } from '../utils/date'
import { PLATFORM_BADGE } from '../utils/platform'

interface Props {
  conversations: Conversation[]
  onOpen: (url: string) => void
}

export default function BookmarkList({ conversations, onOpen }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-400 text-center leading-relaxed">
        ブックマークはまだありません。
        <br />
        会話ページの★ボタンで追加できます。
      </div>
    )
  }

  return (
    <div role="list">
      {conversations.map(conv => {
        const badge = PLATFORM_BADGE[conv.platform] ?? { label: conv.platform, className: 'bg-gray-100 text-gray-700' }
        return (
          <div
            key={conv.id}
            role="listitem"
          >
            <div
              role="button"
              tabIndex={0}
              className="px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onOpen(conv.url)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpen(conv.url)
                }
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${badge.className}`}>
                  {badge.label}
                </span>
                <span className="text-sm font-medium text-gray-800 truncate flex-1">
                  {conv.title}
                </span>
                <span className="text-yellow-400">★</span>
              </div>
              <div className="text-xs text-gray-400">{formatDate(conv.lastMessageAt)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
