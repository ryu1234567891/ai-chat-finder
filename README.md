# AI Chat Finder

Chrome extension that automatically saves your AI conversations and lets you search across them instantly — **100% local, zero network requests, open source.**

## Install

**[➡️ Get it on the Chrome Web Store](https://chromewebstore.google.com/detail/lgclaigmciabcgfcaofkjggllkfecfgf)**

Or [build it from source](#build-instructions) yourself to verify exactly what you're installing.

## Supported Services

| Service | URL |
|---|---|
| Claude.ai | claude.ai |
| ChatGPT | chatgpt.com |
| Gemini | gemini.google.com |
| Microsoft Copilot | copilot.microsoft.com |
| Perplexity | perplexity.ai |
| Grok | grok.com |
| DeepSeek | chat.deepseek.com |

## 🔒 Privacy & Security

**The full source code is publicly available. Anyone can verify its safety.**

- All data is stored exclusively in your browser's **IndexedDB** — no cloud, no server
- **Zero network requests** — the extension makes no outbound connections whatsoever
- Verify this yourself: open DevTools → Network tab while using the extension
- Only `storage` and `alarms` permissions are requested — no `tabs`, no `activeTab`, no broad host access
- Conversations are automatically deleted after 14 days
- One-click data deletion available in the popup

### What is stored (locally only)
- AI chat text (user messages + AI responses)
- Conversation URL and title
- Timestamps

### What is NOT collected
- Account information, passwords, or email addresses
- Cookies or authentication tokens
- Browsing history outside supported AI services
- Any analytics or usage data

## Build Instructions

Anyone can build the extension from source to verify what is being installed.

### Prerequisites
- Node.js 18+
- npm

### Steps

```bash
# Clone the repository
git clone https://github.com/ryu1234567891/ai-chat-finder.git
cd ai-chat-finder

# Install dependencies
npm install

# Build
npm run build

# The built extension will be in the dist/ directory
# Load it in Chrome: chrome://extensions → Load unpacked → select dist/
```

### Run Tests

```bash
npm test
```

All 21 tests cover search logic and conversation storage.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 + CRXJS |
| Storage | Dexie.js (IndexedDB wrapper) |
| Styling | Tailwind CSS v4 |
| Testing | Vitest + fake-indexeddb |

## Architecture

```
src/
├── background/     # Service worker — saves conversations, runs cleanup
├── content/        # Content scripts — one per AI service, reads DOM
│   └── shared/     # Shared: MutationObserver, DOM extractor
├── db/             # IndexedDB schema, search, CRUD
├── popup/          # React UI — search bar, results, data manager
├── types/          # Shared TypeScript types
└── utils/          # Constants, date formatting
```

Content scripts are built as self-contained IIFEs (not ES modules) to avoid CSP issues on AI chat pages.

## License

MIT
