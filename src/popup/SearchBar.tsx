import { useState, useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (query: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

const DEBOUNCE_MS = 300

export default function SearchBar({ value, onChange, onKeyDown }: Props) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 外部から value がリセットされたとき（例: 全削除後）に同期する
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setLocalValue(next)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(next)
    }, DEBOUNCE_MS)
  }

  // アンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <input
      type="text"
      role="searchbox"
      aria-label="会話を検索"
      value={localValue}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      placeholder="会話を検索..."
      autoFocus
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}
