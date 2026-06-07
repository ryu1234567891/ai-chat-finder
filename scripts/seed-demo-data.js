// AI Chat Finder — デモ用ダミーデータ投入スクリプト
// 使い方: 拡張機能のポップアップを開き、DevTools コンソールで貼り付けて実行

(async () => {
  const DB_NAME = 'AIChatFinder'
  const STORE = 'conversations'

  const now = Date.now()
  const days = (n) => now - n * 24 * 60 * 60 * 1000
  const hours = (n) => now - n * 60 * 60 * 1000

  const conversations = [
    {
      id: crypto.randomUUID(),
      platform: 'claude',
      platformConversationId: 'demo-claude-1',
      title: 'Reactのパフォーマンス最適化について',
      url: 'https://claude.ai/chat/demo-1',
      messages: [
        { role: 'user', content: 'Reactアプリが重くなってきました。useMemoCとuseCallbackはどう使い分ければいいですか？', timestamp: hours(2) },
        { role: 'assistant', content: 'useMemoは計算結果をメモ化し、useCallbackは関数をメモ化します。基本的には「子コンポーネントにpropsとして渡す関数」にはuseCallback、「重い計算処理の結果」にはuseMemoを使うのが原則です。ただし、過剰なメモ化は逆にパフォーマンスを悪化させることもあります。', timestamp: hours(2) },
        { role: 'user', content: 'なるほど。React DevToolsのProfilerで確認する方法も教えてください', timestamp: hours(1) },
        { role: 'assistant', content: 'React DevToolsのProfilerタブを開き、「Record」ボタンを押してからアプリを操作します。レンダリングのフレームグラフが表示され、各コンポーネントのレンダリング時間と原因が確認できます。', timestamp: hours(1) },
      ],
      firstMessageAt: hours(2),
      lastMessageAt: hours(1),
      capturedAt: hours(1),
      isBookmarked: false,
      tags: [],
    },
    {
      id: crypto.randomUUID(),
      platform: 'chatgpt',
      platformConversationId: 'demo-chatgpt-1',
      title: 'Python でCSVを処理する方法',
      url: 'https://chatgpt.com/c/demo-2',
      messages: [
        { role: 'user', content: '大きなCSVファイルを効率よく処理したい。pandasを使うべきですか？', timestamp: days(1) },
        { role: 'assistant', content: 'ファイルサイズによります。数GB以上なら、pandasより`csv`モジュールやpolarsの方がメモリ効率が良いです。chunksizeを使ってpandasで分割読み込みする方法もあります。', timestamp: days(1) },
        { role: 'user', content: 'polarsを使ったサンプルコードを見せてください', timestamp: days(1) },
        { role: 'assistant', content: 'import polars as pl\n\ndf = pl.read_csv("large_file.csv")\nresult = df.filter(pl.col("age") > 30).groupby("city").agg(pl.col("salary").mean())\nprint(result)', timestamp: days(1) },
      ],
      firstMessageAt: days(1),
      lastMessageAt: days(1),
      capturedAt: days(1),
      isBookmarked: true,
      tags: [],
    },
    {
      id: crypto.randomUUID(),
      platform: 'gemini',
      platformConversationId: 'demo-gemini-1',
      title: 'マーケティング戦略の立て方',
      url: 'https://gemini.google.com/app/demo-3',
      messages: [
        { role: 'user', content: 'スタートアップのSaaSプロダクトのマーケティング戦略を考えたい。予算は月30万円です', timestamp: days(2) },
        { role: 'assistant', content: '月30万円であれば、コンテンツマーケティング（SEO記事・YouTube）に15万、リスティング広告に10万、SNS運用に5万という配分が現実的です。初期はコンテンツ資産を積み上げることで、長期的なCAC低下を狙えます。', timestamp: days(2) },
      ],
      firstMessageAt: days(2),
      lastMessageAt: days(2),
      capturedAt: days(2),
      isBookmarked: false,
      tags: [],
    },
    {
      id: crypto.randomUUID(),
      platform: 'claude',
      platformConversationId: 'demo-claude-2',
      title: 'TypeScriptの型エラーを解決したい',
      url: 'https://claude.ai/chat/demo-4',
      messages: [
        { role: 'user', content: 'TypeScriptでこんなエラーが出ます: "Type \'string | undefined\' is not assignable to type \'string\'"', timestamp: days(3) },
        { role: 'assistant', content: '`undefined`の可能性があるため発生しています。解決策は3つあります。①Optional chaining: `value?.toUpperCase()` ②Non-null assertion: `value!.toUpperCase()` ③型ガード: `if (value !== undefined) { value.toUpperCase() }` — 安全なのは③です。', timestamp: days(3) },
        { role: 'user', content: 'Zodを使ってAPIレスポンスをバリデーションする方法も知りたい', timestamp: days(3) },
        { role: 'assistant', content: 'Zodでスキーマを定義してparseするだけです。const schema = z.object({ name: z.string(), age: z.number() }); const result = schema.parse(apiResponse); これでresultは完全に型安全になります。', timestamp: days(3) },
      ],
      firstMessageAt: days(3),
      lastMessageAt: days(3),
      capturedAt: days(3),
      isBookmarked: false,
      tags: [],
    },
    {
      id: crypto.randomUUID(),
      platform: 'perplexity',
      platformConversationId: 'demo-perplexity-1',
      title: '2024年のAIトレンド調査',
      url: 'https://www.perplexity.ai/search/demo-5',
      messages: [
        { role: 'user', content: '2024年のAI業界のトレンドを教えてください', timestamp: days(4) },
        { role: 'assistant', content: '2024年の主要トレンド: ①マルチモーダルAIの普及（GPT-4o、Gemini 1.5）②エッジAI・オンデバイス推論の進化 ③AIエージェントの実用化 ④規制・ガバナンスの整備（EU AI Act施行）⑤コスト競争による民主化が挙げられます。', timestamp: days(4) },
      ],
      firstMessageAt: days(4),
      lastMessageAt: days(4),
      capturedAt: days(4),
      isBookmarked: false,
      tags: [],
    },
    {
      id: crypto.randomUUID(),
      platform: 'deepseek',
      platformConversationId: 'demo-deepseek-1',
      title: 'アルゴリズムの時間複雑度を解説して',
      url: 'https://chat.deepseek.com/demo-6',
      messages: [
        { role: 'user', content: 'Big O記法とO(n log n)のアルゴリズムの例を教えてください', timestamp: days(5) },
        { role: 'assistant', content: 'Big O記法はアルゴリズムの計算量をnの関数で表します。O(n log n)の代表例はマージソートとクイックソートです。配列をn個の要素に分割しながら（log n回）、各レベルでn要素を処理するため、O(n log n)になります。', timestamp: days(5) },
      ],
      firstMessageAt: days(5),
      lastMessageAt: days(5),
      capturedAt: days(5),
      isBookmarked: false,
      tags: [],
    },
    {
      id: crypto.randomUUID(),
      platform: 'grok',
      platformConversationId: 'demo-grok-1',
      title: 'ビジネスメールの書き方',
      url: 'https://grok.com/chat/demo-7',
      messages: [
        { role: 'user', content: '取引先への謝罪メールを丁寧に書きたい。納品が3日遅れてしまいました', timestamp: days(6) },
        { role: 'assistant', content: '件名: 納品遅延のお詫び\n\nお世話になっております。この度は納品が予定より3日遅れてしまい、誠に申し訳ございません。原因は〇〇であり、再発防止のため〇〇を徹底いたします。今後ともご指導のほどよろしくお願い申し上げます。', timestamp: days(6) },
      ],
      firstMessageAt: days(6),
      lastMessageAt: days(6),
      capturedAt: days(6),
      isBookmarked: false,
      tags: [],
    },
    {
      id: crypto.randomUUID(),
      platform: 'copilot',
      platformConversationId: 'demo-copilot-1',
      title: 'Excelで売上データを集計する方法',
      url: 'https://copilot.microsoft.com/chat/demo-8',
      messages: [
        { role: 'user', content: 'Excelで月別・商品別の売上をピボットテーブルで集計したい', timestamp: days(7) },
        { role: 'assistant', content: 'ピボットテーブルの作成手順: ①データ範囲を選択 ②挿入 → ピボットテーブル ③行に「月」、列に「商品名」、値に「売上金額（合計）」をドラッグ。スライサーを追加すると対象期間の絞り込みも簡単にできます。', timestamp: days(7) },
      ],
      firstMessageAt: days(7),
      lastMessageAt: days(7),
      capturedAt: days(7),
      isBookmarked: false,
      tags: [],
    },
  ]

  // IndexedDB に直接書き込む
  const request = indexedDB.open(DB_NAME, 10)

  request.onsuccess = (event) => {
    const db = event.target.result
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)

    for (const conv of conversations) {
      store.put(conv)
    }

    tx.oncomplete = () => {
      console.log(`✅ ${conversations.length}件のデモデータを投入しました。ポップアップを再度開いてください。`)
    }
    tx.onerror = (e) => {
      console.error('❌ エラー:', e.target.error)
    }
  }

  request.onerror = (e) => {
    console.error('❌ DB接続エラー:', e.target.error)
  }
})()
