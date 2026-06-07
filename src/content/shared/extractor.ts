import type { Message } from '../../types'

interface ExtractedConversation {
  title: string
  messages: Message[]
  firstMessageAt: number
  lastMessageAt: number
}

// ── Claude.ai ──────────────────────────────────────────────────────────────

const SEL_CLAUDE_USER_CANDIDATES = [
  'div[data-testid="user-message-bubble"]',
  'div[data-testid="user-message"]',
  'div.font-user-message',
  '[data-testid*="user"]',
]
const SEL_CLAUDE_ASSISTANT = 'div.font-claude-response'

function findClaudeUserElements(): Element[] {
  for (const sel of SEL_CLAUDE_USER_CANDIDATES) {
    const els = Array.from(document.querySelectorAll(sel))
    if (els.length > 0) return els
  }
  return []
}

export function extractClaudeConversation(): ExtractedConversation | null {
  const title = document.title.replace(/ ?[-–|] ?Claude.*$/, '').trim() || '無題'
  const now = Date.now()

  const userEls = findClaudeUserElements()
  const winnerSel = SEL_CLAUDE_USER_CANDIDATES.find(
    sel => userEls.length > 0 && userEls[0].matches(sel)
  ) ?? SEL_CLAUDE_USER_CANDIDATES[0]
  const assistantEls = Array.from(document.querySelectorAll(SEL_CLAUDE_ASSISTANT))
    .filter(el => !el.closest(winnerSel))

  return buildConversation(title, userEls, assistantEls, now)
}

// ── Gemini ─────────────────────────────────────────────────────────────────

const SEL_GEMINI_USER_CANDIDATES = [
  'user-query',
  '[data-testid="user-query"]',
  '[data-testid*="user"]',
  '.user-query-text',
  'message-content[is-user]',
]
const SEL_GEMINI_ASSISTANT_CANDIDATES = [
  'model-response',
  '[data-testid="model-response"]',
  '[data-testid*="model"]',
  '.model-response-text',
  'message-content:not([is-user])',
]

function findByCandidates(candidates: string[]): Element[] {
  for (const sel of candidates) {
    try {
      const els = Array.from(document.querySelectorAll(sel))
      if (els.length > 0) return els
    } catch {
      // 無効なセレクタは無視
    }
  }
  return []
}

export function extractGeminiConversation(): ExtractedConversation | null {
  const title = document.title.replace(/ ?[-–|] ?Gemini.*$/, '').trim() || '無題'
  const now = Date.now()

  const userEls = findByCandidates(SEL_GEMINI_USER_CANDIDATES)
  const assistantEls = findByCandidates(SEL_GEMINI_ASSISTANT_CANDIDATES)
  return buildConversation(title, userEls, assistantEls, now)
}

// ── ChatGPT ────────────────────────────────────────────────────────────────

const SEL_GPT_USER = 'div[data-message-author-role="user"]'
const SEL_GPT_ASSISTANT = 'div[data-message-author-role="assistant"]'

export function extractChatGPTConversation(): ExtractedConversation | null {
  const title = document.title.replace(/ ?[-–|]? ?ChatGPT.*$/, '').trim() || '無題'
  const now = Date.now()

  let userEls = Array.from(document.querySelectorAll(SEL_GPT_USER))
  let assistantEls = Array.from(document.querySelectorAll(SEL_GPT_ASSISTANT))

  // フォールバック: article 要素の内側を探す
  if (userEls.length === 0 && assistantEls.length === 0) {
    for (const article of document.querySelectorAll('article')) {
      const u = article.querySelector(SEL_GPT_USER)
      const a = article.querySelector(SEL_GPT_ASSISTANT)
      if (u) userEls.push(u)
      if (a) assistantEls.push(a)
    }
  }

  return buildConversation(title, userEls, assistantEls, now)
}

// ── Copilot ────────────────────────────────────────────────────────────────

const SEL_COPILOT_USER: string[] = [
  '[data-testid="user-message"]',
  '[data-testid*="user"]',
  '[class*="userMessage"]',
  '[class*="user-message"]',
  '[class*="HumanTurn"]',
  '[data-role="user"]',
  'cib-chat-turn[source="user"]',
]
const SEL_COPILOT_ASSISTANT: string[] = [
  '[data-testid="ai-message"]',
  '[data-testid*="bot"]',
  '[data-testid*="assistant"]',
  '[class*="botMessage"]',
  '[class*="bot-message"]',
  '[class*="AiTurn"]',
  '[data-role="assistant"]',
  'cib-chat-turn[source="bot"]',
  'cib-message-group[source="bot"]',
]

export function extractCopilotConversation(): ExtractedConversation | null {
  const title = document.title.replace(/ ?[-–|] ?(?:Microsoft )?Copilot.*$/, '').trim() || '無題'
  const now = Date.now()
  const userEls = findByCandidates(SEL_COPILOT_USER)
  const assistantEls = findByCandidates(SEL_COPILOT_ASSISTANT)
  return buildConversation(title, userEls, assistantEls, now)
}

// ── Perplexity ─────────────────────────────────────────────────────────────

const SEL_PERPLEXITY_USER: string[] = [
  '[data-testid="user-query"]',
  '[data-testid*="user"]',
  '[data-testid*="query"]',
  '[class*="userQuery"]',
  '[class*="user-query"]',
  '[class*="UserQuery"]',
  '[class*="HumanMessage"]',
  'textarea[placeholder]',
]
const SEL_PERPLEXITY_ASSISTANT: string[] = [
  '[data-testid="answer"]',
  '[data-testid*="answer"]',
  '[data-testid*="response"]',
  '[data-testid*="assistant"]',
  '[class*="answerText"]',
  '[class*="answer-text"]',
  '[class*="AnswerBody"]',
  '[class*="prose"]',
]

export function extractPerplexityConversation(): ExtractedConversation | null {
  const title = document.title.replace(/ ?[-–|] ?Perplexity.*$/, '').trim() || '無題'
  const now = Date.now()
  const userEls = findByCandidates(SEL_PERPLEXITY_USER)
  const assistantEls = findByCandidates(SEL_PERPLEXITY_ASSISTANT)
  return buildConversation(title, userEls, assistantEls, now)
}

// ── Grok ───────────────────────────────────────────────────────────────────

const SEL_GROK_USER: string[] = [
  '[data-testid="user-message"]',
  '[data-testid*="user"]',
  '[data-testid*="human"]',
  '[class*="userMessage"]',
  '[class*="user-message"]',
  '[class*="UserMessage"]',
  '[class*="HumanMessage"]',
  '[data-message-author-role="user"]',
]
const SEL_GROK_ASSISTANT: string[] = [
  '[data-testid="grok-message"]',
  '[data-testid*="grok"]',
  '[data-testid*="assistant"]',
  '[data-testid*="ai"]',
  '[class*="grokMessage"]',
  '[class*="AssistantMessage"]',
  '[class*="ai-message"]',
  '[data-message-author-role="assistant"]',
]

export function extractGrokConversation(): ExtractedConversation | null {
  const title = document.title.replace(/ ?[-–|] ?Grok.*$/, '').trim() || '無題'
  const now = Date.now()
  const userEls = findByCandidates(SEL_GROK_USER)
  const assistantEls = findByCandidates(SEL_GROK_ASSISTANT)
  return buildConversation(title, userEls, assistantEls, now)
}

// ── DeepSeek ───────────────────────────────────────────────────────────────

const SEL_DEEPSEEK_USER: string[] = [
  '[data-testid="user-message"]',
  '[data-testid*="user"]',
  '[data-testid*="human"]',
  '[class*="userMessage"]',
  '[class*="user-message"]',
  '[class*="UserMessage"]',
  '[class*="chat-a"]',
  '[class*="fbb737a4"]',
]
const SEL_DEEPSEEK_ASSISTANT: string[] = [
  '[data-testid="assistant-message"]',
  '[data-testid*="assistant"]',
  '[data-testid*="deepseek"]',
  '[class*="assistantMessage"]',
  '[class*="assistant-message"]',
  '[class*="AssistantMessage"]',
  '[class*="ds-markdown"]',
  '[class*="chat-b"]',
]

export function extractDeepSeekConversation(): ExtractedConversation | null {
  const title = document.title.replace(/ ?[-–|] ?DeepSeek.*$/, '').trim() || '無題'
  const now = Date.now()
  const userEls = findByCandidates(SEL_DEEPSEEK_USER)
  const assistantEls = findByCandidates(SEL_DEEPSEEK_ASSISTANT)
  return buildConversation(title, userEls, assistantEls, now)
}

// ── 共通ビルダー ──────────────────────────────────────────────────────────

const MAX_MESSAGE_CHARS = 5000
const MAX_TOTAL_CHARS = 50000

function buildConversation(
  title: string,
  userEls: Element[],
  assistantEls: Element[],
  now: number
): ExtractedConversation | null {
  if (userEls.length === 0 && assistantEls.length === 0) return null

  const allTurns: { el: Element; role: 'user' | 'assistant' }[] = [
    ...userEls.map(el => ({ el, role: 'user' as const })),
    ...assistantEls.map(el => ({ el, role: 'assistant' as const })),
  ]

  allTurns.sort((a, b) =>
    a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  )

  const messages: Message[] = []
  let totalChars = 0
  for (const { el, role } of allTurns) {
    const raw = el.textContent?.trim() ?? ''
    if (!raw) continue
    const content = raw.slice(0, MAX_MESSAGE_CHARS)
    totalChars += content.length
    if (totalChars > MAX_TOTAL_CHARS) break
    messages.push({ role, content, timestamp: now })
  }

  if (messages.length === 0) return null
  return { title, messages, firstMessageAt: now, lastMessageAt: now }
}
