/**
 * SECURITY NOTE:
 * This extension does NOT make any network requests.
 * All data is stored locally in IndexedDB.
 * No fetch(), XMLHttpRequest, WebSocket, or any external communication.
 * This can be verified by:
 * 1. Searching the entire codebase for fetch/XMLHttpRequest/WebSocket
 * 2. Monitoring the Network tab in DevTools while using the extension
 * 3. Reviewing the complete source code on GitHub
 */

import { saveConversation, toggleBookmarkByUrl, deleteOldConversations, clearAllConversations } from '../db/conversations'
import type { BackgroundMessage } from '../types'
import { FREE_MAX_AGE_DAYS } from '../utils/constants'

chrome.runtime.onMessage.addListener(
  (message: BackgroundMessage, sender, sendResponse) => {
    // 送信元検証: 自拡張機能からのメッセージのみ受け付ける
    if (sender.id !== chrome.runtime.id) return

    if (message.type === 'SAVE_CONVERSATION') {
      saveConversation(message.conversation)
        .then(id => sendResponse({ success: true, id }))
        .catch(err => {
          console.error('[AI Chat Finder] 保存失敗:', err)
          sendResponse({ success: false })
        })
      return true
    }

    if (message.type === 'TOGGLE_BOOKMARK_BY_URL') {
      toggleBookmarkByUrl(message.url)
        .then(isBookmarked => sendResponse({ isBookmarked }))
        .catch(() => sendResponse({ isBookmarked: false }))
      return true
    }

    if (message.type === 'CLEANUP_OLD') {
      deleteOldConversations(FREE_MAX_AGE_DAYS)
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false }))
      return true
    }

    if (message.type === 'CLEAR_ALL_DATA') {
      clearAllConversations()
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false }))
      return true
    }
  }
)

chrome.runtime.onInstalled.addListener(() => {
  deleteOldConversations(FREE_MAX_AGE_DAYS)
  chrome.alarms.create('daily-cleanup', { periodInMinutes: 60 * 24 })
})

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'daily-cleanup') {
    deleteOldConversations(FREE_MAX_AGE_DAYS)
  }
})
