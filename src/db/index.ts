import Dexie, { type Table } from 'dexie'
import type { Conversation } from '../types'

class AIChatDatabase extends Dexie {
  conversations!: Table<Conversation, string>

  constructor() {
    super('AIChatFinder')
    this.version(1).stores({
      // インデックスを貼るフィールドのみ列挙（他のフィールドも保存される）
      conversations: 'id, platform, platformConversationId, lastMessageAt, capturedAt',
    })
  }
}

export const db = new AIChatDatabase()
