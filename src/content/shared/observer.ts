import { OBSERVER_DEBOUNCE_MS } from '../../utils/constants'

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let observer: MutationObserver | null = null

export function setupObserver(onConversationChange: () => void): void {
  observer?.disconnect()

  observer = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(onConversationChange, OBSERVER_DEBOUNCE_MS)
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: false,
  })
}

export function disconnectObserver(): void {
  observer?.disconnect()
  observer = null
}
