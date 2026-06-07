import { setupObserver } from './shared/observer'
import { extractDeepSeekConversation } from './shared/extractor'
import { URL_CHANGE_DELAY_MS } from '../utils/constants'

function getConversationId(): string | null {
  // https://chat.deepseek.com/a/chat/XXXX
  const match = window.location.pathname.match(/\/(?:a\/)?chat\/([^/?#]+)/)
  if (match) return match[1]
  // クエリパラメータ fallback
  const id = new URLSearchParams(window.location.search).get('id')
  if (id) return id
  return null
}

let isSaving = false

function captureAndSave(): void {
  if (isSaving) return
  const platformConversationId = getConversationId()
  if (!platformConversationId) return

  const data = extractDeepSeekConversation()
  if (!data || data.messages.length === 0) return

  isSaving = true
  chrome.runtime.sendMessage(
    {
      type: 'SAVE_CONVERSATION',
      conversation: {
        platform: 'deepseek',
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
