import { setupObserver } from './shared/observer'
import { extractPerplexityConversation } from './shared/extractor'
import { URL_CHANGE_DELAY_MS } from '../utils/constants'

function getConversationId(): string | null {
  // https://www.perplexity.ai/search/SLUG-XXXXXXXXXXXX
  const match = window.location.pathname.match(/\/search\/([^/?#]+)/)
  if (match) return match[1]
  // https://www.perplexity.ai/page/...
  const page = window.location.pathname.match(/\/page\/([^/?#]+)/)
  if (page) return page[1]
  return null
}

let isSaving = false

function captureAndSave(): void {
  if (isSaving) return
  const platformConversationId = getConversationId()
  if (!platformConversationId) return

  const data = extractPerplexityConversation()
  if (!data || data.messages.length === 0) return

  isSaving = true
  chrome.runtime.sendMessage(
    {
      type: 'SAVE_CONVERSATION',
      conversation: {
        platform: 'perplexity',
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
