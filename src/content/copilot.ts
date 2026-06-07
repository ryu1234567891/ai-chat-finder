import { setupObserver } from './shared/observer'
import { extractCopilotConversation } from './shared/extractor'
import { URL_CHANGE_DELAY_MS } from '../utils/constants'

function getConversationId(): string | null {
  // https://copilot.microsoft.com/chats/XXXX or /c/XXXX
  const match = window.location.pathname.match(/\/(?:chats?|c)\/([^/?#]+)/)
  if (match) return match[1]
  // フォールバック: クエリパラメータ
  const searchId = new URLSearchParams(window.location.search).get('id')
  if (searchId) return searchId
  // ルートページ（会話IDなし）は保存しない
  return null
}

let isSaving = false

function captureAndSave(): void {
  if (isSaving) return
  const platformConversationId = getConversationId()
  if (!platformConversationId) return

  const data = extractCopilotConversation()
  if (!data || data.messages.length === 0) return

  isSaving = true
  chrome.runtime.sendMessage(
    {
      type: 'SAVE_CONVERSATION',
      conversation: {
        platform: 'copilot',
        platformConversationId,
        url: window.location.href,
        isBookmarked: false,
        tags: [],
        ...data,
      },
    },
    _response => {
      if (chrome.runtime.lastError) return
      isSaving = false
    }
  )
}

function handleNavigation(): void {
  isSaving = false
  setTimeout(captureAndSave, URL_CHANGE_DELAY_MS)
}

// history.pushState の二重上書き防止
const PATCHED = '__ai_chat_finder_patched__'
if (!(history as any)[PATCHED]) {
  ;(history as any)[PATCHED] = true
  const originalPushState = history.pushState.bind(history)
  history.pushState = function (...args: Parameters<typeof history.pushState>) {
    originalPushState(...args)
    handleNavigation()
  }
  window.addEventListener('popstate', handleNavigation)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupObserver(captureAndSave)
    handleNavigation()
  })
} else {
  setupObserver(captureAndSave)
  handleNavigation()
}
