import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../index'
import { saveConversation, toggleBookmark, getBookmarked, deleteOldConversations } from '../conversations'
import type { Conversation } from '../../types'

function makeConvData(overrides: Partial<Omit<Conversation, 'id' | 'capturedAt'>> = {}) {
  return {
    platform: 'claude' as const,
    platformConversationId: 'test-conv-1',
    title: 'テスト会話',
    url: 'https://claude.ai/chat/test-conv-1',
    messages: [
      { role: 'user' as const, content: 'こんにちは', timestamp: 1000 },
      { role: 'assistant' as const, content: 'こんにちは！', timestamp: 2000 },
    ],
    firstMessageAt: 1000,
    lastMessageAt: 2000,
    isBookmarked: false,
    tags: [],
    ...overrides,
  }
}

beforeEach(async () => {
  await db.conversations.clear()
})

describe('saveConversation', () => {
  it('新しい会話を保存し、IDを返す', async () => {
    const id = await saveConversation(makeConvData())
    expect(id).toBeTruthy()
    const saved = await db.conversations.get(id)
    expect(saved).toBeDefined()
    expect(saved?.platform).toBe('claude')
    expect(saved?.title).toBe('テスト会話')
    expect(saved?.capturedAt).toBeGreaterThan(0)
  })

  it('同じplatformConversationIdの場合は更新する（重複しない）', async () => {
    const id1 = await saveConversation(makeConvData())
    const id2 = await saveConversation(makeConvData({ title: '更新済みタイトル' }))
    expect(id1).toBe(id2)
    const saved = await db.conversations.get(id1)
    expect(saved?.title).toBe('更新済みタイトル')
    const all = await db.conversations.toArray()
    expect(all).toHaveLength(1)
  })

  it('capturedAtは更新時に変わらない', async () => {
    const id = await saveConversation(makeConvData())
    const first = await db.conversations.get(id)
    await new Promise(r => setTimeout(r, 10))
    await saveConversation(makeConvData({ title: '更新' }))
    const second = await db.conversations.get(id)
    expect(second?.capturedAt).toBe(first?.capturedAt)
  })
})

describe('toggleBookmark', () => {
  it('ブックマーク状態をトグルできる', async () => {
    const id = await saveConversation(makeConvData())
    await toggleBookmark(id)
    expect((await db.conversations.get(id))?.isBookmarked).toBe(true)
    await toggleBookmark(id)
    expect((await db.conversations.get(id))?.isBookmarked).toBe(false)
  })

  it('存在しないIDでもエラーにならない', async () => {
    await expect(toggleBookmark('non-existent')).resolves.toBeUndefined()
  })
})

describe('getBookmarked', () => {
  it('ブックマーク済みの会話だけを返す', async () => {
    const id1 = await saveConversation(makeConvData({ platformConversationId: 'conv-1' }))
    await saveConversation(makeConvData({ platformConversationId: 'conv-2' }))
    await toggleBookmark(id1)
    const bookmarked = await getBookmarked()
    expect(bookmarked).toHaveLength(1)
    expect(bookmarked[0].id).toBe(id1)
  })

  it('ブックマークがなければ空配列を返す', async () => {
    await saveConversation(makeConvData())
    const bookmarked = await getBookmarked()
    expect(bookmarked).toHaveLength(0)
  })
})

describe('deleteOldConversations', () => {
  it('指定日数より古い会話を削除する', async () => {
    const oldDate = Date.now() - 20 * 24 * 60 * 60 * 1000
    await db.conversations.add({
      id: 'old-conv',
      platform: 'claude',
      platformConversationId: 'old',
      title: '古い会話',
      url: '',
      messages: [],
      firstMessageAt: oldDate,
      lastMessageAt: oldDate,
      capturedAt: oldDate,
      isBookmarked: false,
      tags: [],
    })
    await deleteOldConversations(14)
    expect(await db.conversations.count()).toBe(0)
  })

  it('ブックマーク済みは古くても削除しない', async () => {
    const oldDate = Date.now() - 20 * 24 * 60 * 60 * 1000
    await db.conversations.add({
      id: 'old-bookmarked',
      platform: 'claude',
      platformConversationId: 'old-bm',
      title: 'ブックマーク済み古い会話',
      url: '',
      messages: [],
      firstMessageAt: oldDate,
      lastMessageAt: oldDate,
      capturedAt: oldDate,
      isBookmarked: true,
      tags: [],
    })
    await deleteOldConversations(14)
    expect(await db.conversations.count()).toBe(1)
  })

  it('新しい会話は削除しない', async () => {
    const id = await saveConversation(makeConvData())
    await deleteOldConversations(14)
    expect(await db.conversations.get(id)).toBeDefined()
  })
})
