const BUTTON_ID = 'ai-chat-finder-bookmark-btn'

export function injectBookmarkButton(): void {
  if (document.getElementById(BUTTON_ID)) return

  const toolbar =
    document.querySelector('[data-testid="chat-header"]') ??
    document.querySelector('header nav') ??
    document.querySelector('header')

  if (!toolbar) return

  let isBookmarked = false

  const btn = document.createElement('button')
  btn.id = BUTTON_ID
  btn.title = 'AI Chat Finder: ブックマーク'
  btn.textContent = '★'
  Object.assign(btn.style, {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#888',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'color 0.2s',
  })

  const updateColor = () => {
    btn.style.color = isBookmarked ? '#f5a623' : '#888'
  }

  btn.addEventListener('mouseenter', () => { btn.style.color = '#f5a623' })
  btn.addEventListener('mouseleave', updateColor)
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage(
      { type: 'TOGGLE_BOOKMARK_BY_URL', url: window.location.href },
      (response: { isBookmarked: boolean } | undefined) => {
        if (chrome.runtime.lastError) return
        if (response) {
          isBookmarked = response.isBookmarked
          updateColor()
        }
      }
    )
  })

  toolbar.appendChild(btn)
}

export function removeBookmarkButton(): void {
  document.getElementById(BUTTON_ID)?.remove()
}
