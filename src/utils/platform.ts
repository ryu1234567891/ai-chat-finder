export const PLATFORM_BADGE: Record<string, { label: string; className: string }> = {
  claude:     { label: 'Claude',      className: 'bg-orange-100 text-orange-700'   },
  chatgpt:    { label: 'ChatGPT',     className: 'bg-green-100 text-green-700'     },
  gemini:     { label: 'Gemini',      className: 'bg-blue-100 text-blue-700'       },
  copilot:    { label: 'Copilot',     className: 'bg-sky-100 text-sky-700'         },
  perplexity: { label: 'Perplexity',  className: 'bg-teal-100 text-teal-700'       },
  grok:       { label: 'Grok',        className: 'bg-gray-900 text-white'          },
  deepseek:   { label: 'DeepSeek',    className: 'bg-indigo-100 text-indigo-700'   },
}

export const PLATFORMS = Object.keys(PLATFORM_BADGE) as string[]
