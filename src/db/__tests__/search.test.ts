import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../index'
import { searchConversations } from '../search'

beforeEach(async () => {
  await db.conversations.clear()
  await db.conversations.bulkAdd([
    {
      id: 'conv-1',
      platform: 'claude',
      platformConversationId: 'c-1',
      title: 'Pythonについて',
      url: 'https://claude.ai/chat/c-1',
      messages: [
        { role: 'user', content: 'Pythonのfor文を教えて', timestamp: 1000 },
        { role: 'assistant', content: 'Pythonのfor文はシンプルです', timestamp: 2000 },
      ],
      firstMessageAt: 1000,
      lastMessageAt: 2000,
      capturedAt: 1000,
      isBookmarked: false,
      tags: [],
    },
    {
      id: 'conv-2',
      platform: 'claude',
      platformConversationId: 'c-2',
      title: 'TypeScriptの型',
      url: 'https://claude.ai/chat/c-2',
      messages: [
        { role: 'user', content: 'TypeScriptのジェネリクスとは？', timestamp: 3000 },
        { role: 'assistant', content: 'ジェネリクスは型パラメータです', timestamp: 4000 },
      ],
      firstMessageAt: 3000,
      lastMessageAt: 4000,
      capturedAt: 3000,
      isBookmarked: false,
      tags: [],
    },
    {
      // タイトルのみにキーワードを持つ会話（本文にはない）
      id: 'conv-3',
      platform: 'claude',
      platformConversationId: 'c-3',
      title: 'Rustの所有権モデル概要',
      url: 'https://claude.ai/chat/c-3',
      messages: [
        { role: 'user', content: '難しいですね', timestamp: 5000 },
        { role: 'assistant', content: '慣れると良いです', timestamp: 6000 },
      ],
      firstMessageAt: 5000,
      lastMessageAt: 6000,
      capturedAt: 5000,
      isBookmarked: false,
      tags: [],
    },
  ])
})

describe('searchConversations', () => {
  it('メッセージ本文に一致する会話を返す', async () => {
    const results = await searchConversations('Python')
    expect(results).toHaveLength(1)
    expect(results[0].conversation.id).toBe('conv-1')
  })

  it('クエリが空の場合は空配列を返す', async () => {
    expect(await searchConversations('')).toHaveLength(0)
    expect(await searchConversations('   ')).toHaveLength(0)
  })

  it('大文字小文字を区別しない（メッセージ）', async () => {
    expect(await searchConversations('python')).toHaveLength(1)
    expect(await searchConversations('PYTHON')).toHaveLength(1)
  })

  it('会話タイトルでも検索できる（タイトルのみマッチ）', async () => {
    const results = await searchConversations('所有権')
    expect(results).toHaveLength(1)
    expect(results[0].conversation.id).toBe('conv-3')
    expect(results[0].snippet).toContain('所有権')
  })

  it('大文字小文字を区別しない（タイトル）', async () => {
    const results = await searchConversations('rust')
    expect(results).toHaveLength(1)
    expect(results[0].conversation.id).toBe('conv-3')
  })

  it('メッセージ本文マッチをタイトルマッチより優先する', async () => {
    // conv-1はタイトルに「Python」、conv-1のメッセージにも「Python」がある
    // メッセージ本文がマッチしたらそちらを使う
    const results = await searchConversations('Python')
    expect(results[0].matchedMessage.content).toContain('Python')
  })

  it('スニペットにキーワードを含む', async () => {
    const results = await searchConversations('ジェネリクス')
    expect(results[0].snippet).toContain('ジェネリクス')
  })

  it('ハイライト範囲を返す', async () => {
    const results = await searchConversations('ジェネリクス')
    expect(results[0].highlightRanges).toHaveLength(1)
    const [start, end] = results[0].highlightRanges[0]
    expect(end).toBeGreaterThan(start)
  })

  it('マッチしたメッセージを返す', async () => {
    const results = await searchConversations('for文')
    expect(results[0].matchedMessage.content).toContain('for文')
  })

  it('1会話につき1件の結果を返す', async () => {
    const results = await searchConversations('Python')
    const conv1Results = results.filter(r => r.conversation.id === 'conv-1')
    expect(conv1Results).toHaveLength(1)
  })

  it('最終メッセージ日時の降順でソートする', async () => {
    const results = await searchConversations('は')
    expect(results[0].conversation.lastMessageAt).toBeGreaterThanOrEqual(
      results[results.length - 1].conversation.lastMessageAt
    )
  })
})
