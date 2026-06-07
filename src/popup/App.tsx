import { useState, useCallback, useEffect } from 'react'
import SearchBar from './SearchBar'
import ResultList from './ResultList'
import DataManager from './DataManager'
import { searchConversations } from '../db/search'
import { getRecentConversations, getConversationCount, deleteConversation } from '../db/conversations'
import { RECENT_LIMIT } from '../utils/constants'
import type { SearchResult, Conversation } from '../types'

export default function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentConvs, setRecentConvs] = useState<Conversation[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [convCount, setConvCount] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      getRecentConversations(RECENT_LIMIT),
      getConversationCount(),
    ]).then(([convs, count]) => {
      setRecentConvs(convs)
      setConvCount(count)
    })
  }, [])

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q)
    setSelectedIndex(-1)
    if (!q.trim()) {
      setResults([])
      return
    }
    setIsSearching(true)
    try {
      const found = await searchConversations(q)
      setResults(found)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const openUrl = (url: string) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      chrome.tabs.create({ url })
    }
  }

  const handleDelete = useCallback(async (id: string) => {
    await deleteConversation(id)
    setRecentConvs(prev => prev.filter(c => c.id !== id))
    setResults(prev => prev.filter(r => r.conversation.id !== id))
    setConvCount(prev => (prev !== null ? prev - 1 : prev))
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const listLength = query.trim() ? results.length : recentConvs.length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, listLength - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      if (query.trim()) {
        const item = results[selectedIndex]
        if (item) openUrl(item.conversation.url)
      } else {
        const item = recentConvs[selectedIndex]
        if (item) openUrl(item.url)
      }
    }
  }, [query, results, recentConvs, selectedIndex])

  return (
    <div className="w-[400px] min-h-[500px] max-h-[600px] bg-white flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-base font-bold text-gray-800 mb-3">AI Chat Finder</h1>
        <SearchBar value={query} onChange={handleSearch} onKeyDown={handleKeyDown} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ResultList
          results={results}
          recentConversations={recentConvs}
          isLoading={isSearching}
          query={query}
          onOpen={openUrl}
          onDelete={handleDelete}
          selectedIndex={selectedIndex}
        />
      </div>
      <DataManager
        count={convCount}
        onDataCleared={() => {
          setResults([])
          setRecentConvs([])
          setConvCount(0)
        }}
      />
      <div className="px-4 py-2 border-t bg-gray-50 text-center">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          🔒 すべてのデータはブラウザ内に保存されます。外部送信なし。
        </p>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          All data stored locally. No external transmission.
        </p>
      </div>
    </div>
  )
}
