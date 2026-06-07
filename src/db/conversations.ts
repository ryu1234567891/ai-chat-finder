import { db } from './index'
import type { Conversation } from '../types'

export async function saveConversation(
  data: Omit<Conversation, 'id' | 'capturedAt'>
): Promise<string> {
  const existing = await db.conversations
    .where('platformConversationId')
    .equals(data.platformConversationId)
    .first()

  if (existing) {
    await db.conversations.update(existing.id, data)
    return existing.id
  }

  const id = crypto.randomUUID()
  await db.conversations.add({ ...data, id, capturedAt: Date.now() })
  return id
}

export async function toggleBookmark(conversationId: string): Promise<void> {
  const conv = await db.conversations.get(conversationId)
  if (!conv) return
  await db.conversations.update(conversationId, { isBookmarked: !conv.isBookmarked })
}

export async function toggleBookmarkByUrl(url: string): Promise<boolean> {
  const conv = await db.conversations.filter(c => c.url === url).first()
  if (!conv) return false
  const next = !conv.isBookmarked
  await db.conversations.update(conv.id, { isBookmarked: next })
  return next
}

export async function getBookmarked(): Promise<Conversation[]> {
  return db.conversations.filter(c => c.isBookmarked).toArray()
}

export async function getRecentConversations(limit: number): Promise<Conversation[]> {
  return db.conversations
    .orderBy('lastMessageAt')
    .reverse()
    .limit(limit)
    .toArray()
}

export async function deleteOldConversations(maxAgeDays: number): Promise<void> {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000
  await db.conversations
    .where('capturedAt')
    .below(cutoff)
    .filter(c => !c.isBookmarked)
    .delete()
}

export async function deleteConversation(id: string): Promise<void> {
  await db.conversations.delete(id)
}

export async function clearAllConversations(): Promise<void> {
  await db.conversations.clear()
}

export async function getConversationCount(): Promise<number> {
  return db.conversations.count()
}
