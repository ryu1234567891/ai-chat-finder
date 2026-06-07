export function formatDate(timestamp: number): string {
  if (!timestamp || timestamp <= 0) return '不明'

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  // 未来のタイムスタンプや異常値
  if (diffMs < 0) return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMin = Math.floor(diffMs / (1000 * 60))
      return diffMin <= 1 ? 'たった今' : `${diffMin}分前`
    }
    return `${diffHours}時間前`
  }
  if (diffDays === 1) return '昨日'
  if (diffDays < 7) return `${diffDays}日前`

  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}
