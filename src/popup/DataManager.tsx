import { useState } from 'react'

interface Props {
  count: number | null
  onDataCleared: () => void
}

export default function DataManager({ count, onDataCleared }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  function handleDeleteRequest() {
    setShowConfirm(true)
  }

  function handleCancel() {
    setShowConfirm(false)
  }

  async function handleConfirmDelete() {
    setIsDeleting(true)
    chrome.runtime.sendMessage({ type: 'CLEAR_ALL_DATA' }, () => {
      if (chrome.runtime.lastError) {
        setIsDeleting(false)
        return
      }
      setIsDeleting(false)
      setShowConfirm(false)
      onDataCleared()
    })
  }

  return (
    <div className="px-4 py-3 border-t bg-gray-50">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          保存済み: <span className="font-medium text-gray-700">{count ?? '…'}件</span>
        </span>
        <button
          onClick={handleDeleteRequest}
          className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
        >
          全データを削除
        </button>
      </div>

      {showConfirm && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 font-medium mb-1">
            本当にすべての保存データを削除しますか？
          </p>
          <p className="text-xs text-red-500 mb-3">
            この操作は取り消せません。{count}件の会話が削除されます。
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 text-xs py-1.5 bg-red-500 hover:bg-red-600 text-white rounded font-medium disabled:opacity-50 transition-colors"
            >
              {isDeleting ? '削除中…' : '削除する'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 text-xs py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded font-medium transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
