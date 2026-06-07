import { db } from './index'
import type { Message, SearchResult } from '../types'
import { SNIPPET_CONTEXT_CHARS } from '../utils/constants'

function buildSnippet(
  content: string,
  query: string
): { snippet: string; ranges: [number, number][] } {
  const lower = content.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lower.indexOf(lowerQuery)

  if (idx === -1) {
    return { snippet: content.slice(0, SNIPPET_CONTEXT_CHARS * 2), ranges: [] }
  }

  const start = Math.max(0, idx - SNIPPET_CONTEXT_CHARS)
  const end = Math.min(content.length, idx + query.length + SNIPPET_CONTEXT_CHARS)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < content.length ? '...' : ''
  const snippet = prefix + content.slice(start, end) + suffix

  const offsetInSnippet = idx - start + prefix.length
  return {
    snippet,
    ranges: [[offsetInSnippet, offsetInSnippet + query.length]],
  }
}

export async function searchConversations(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const lower = query.toLowerCase()
  const conversations = await db.conversations.toArray()
  const results: SearchResult[] = []

  for (const conv of conversations) {
    // ── メッセージ本文を優先して検索 ───────────────────────────────────────
    let found = false
    for (const msg of conv.messages) {
      if (msg.content.toLowerCase().includes(lower)) {
        const { snippet, ranges } = buildSnippet(msg.content, query)
        results.push({ conversation: conv, matchedMessage: msg, snippet, highlightRanges: ranges })
        found = true
        break
      }
    }

    // ── タイトルのみマッチ（メッセージ本文にはなかった場合） ──────────────
    if (!found && conv.title.toLowerCase().includes(lower)) {
      const { snippet, ranges } = buildSnippet(conv.title, query)
      const firstMsg: Message = conv.messages[0] ?? {
        role: 'user',
        content: conv.title,
        timestamp: conv.capturedAt,
      }
      results.push({ conversation: conv, matchedMessage: firstMsg, snippet, highlightRanges: ranges })
    }
  }

  return results.sort((a, b) => b.conversation.lastMessageAt - a.conversation.lastMessageAt)
}
