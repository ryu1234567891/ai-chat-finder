/**
 * content scripts を CRXJS のローダーパターンを使わず
 * 自己完結 IIFE としてビルドし、dist/manifest.json を更新する。
 *
 * 背景: CRXJS は content script を ES module + 動的 import() のローダー形式で出力する。
 * このローダーが特定サイトの CSP やブラウザ制約でサイレント失敗するため、
 * 単一 IIFE として直接注入する方式に切り替える。
 */

import { build } from 'vite'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

async function buildContentScript(name, entryPath) {
  console.log(`${name} → IIFE ビルド中...`)
  await build({
    configFile: false,
    root,
    build: {
      outDir: resolve(root, 'dist'),
      emptyOutDir: false,
      rollupOptions: {
        input: { [name]: entryPath },
        output: { format: 'iife', entryFileNames: '[name].js' },
      },
    },
    logLevel: 'warn',
  })
}

// ── 1. content scripts を個別に IIFE ビルド ─────────────────────────────────

await buildContentScript('content-claude',      resolve(root, 'src/content/claude.ts'))
await buildContentScript('content-chatgpt',     resolve(root, 'src/content/chatgpt.ts'))
await buildContentScript('content-gemini',      resolve(root, 'src/content/gemini.ts'))
await buildContentScript('content-copilot',     resolve(root, 'src/content/copilot.ts'))
await buildContentScript('content-perplexity',  resolve(root, 'src/content/perplexity.ts'))
await buildContentScript('content-grok',        resolve(root, 'src/content/grok.ts'))
await buildContentScript('content-deepseek',    resolve(root, 'src/content/deepseek.ts'))

// ── 2. dist/manifest.json を更新 ─────────────────────────────────────────────

const manifestPath = resolve(root, 'dist/manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))

manifest.content_scripts = (manifest.content_scripts ?? []).map(cs => {
  if (cs.matches?.includes('https://claude.ai/*')) {
    return { ...cs, js: ['content-claude.js'] }
  }
  if (cs.matches?.some(m => m.includes('chatgpt.com') || m.includes('chat.openai.com'))) {
    return { ...cs, js: ['content-chatgpt.js'] }
  }
  if (cs.matches?.some(m => m.includes('gemini.google.com'))) {
    return { ...cs, js: ['content-gemini.js'] }
  }
  if (cs.matches?.some(m => m.includes('copilot.microsoft.com'))) {
    return { ...cs, js: ['content-copilot.js'] }
  }
  if (cs.matches?.some(m => m.includes('perplexity.ai'))) {
    return { ...cs, js: ['content-perplexity.js'] }
  }
  if (cs.matches?.some(m => m.includes('grok.com'))) {
    return { ...cs, js: ['content-grok.js'] }
  }
  if (cs.matches?.some(m => m.includes('deepseek.com'))) {
    return { ...cs, js: ['content-deepseek.js'] }
  }
  return cs
})

// CRXJS が生成した web_accessible_resources（loader 用）は不要なので削除
if (manifest.web_accessible_resources) {
  manifest.web_accessible_resources = manifest.web_accessible_resources.filter(
    r =>
      !r.matches?.includes('https://claude.ai/*') &&
      !r.matches?.some(m => m.includes('chatgpt.com') || m.includes('chat.openai.com')) &&
      !r.matches?.some(m => m.includes('gemini.google.com')) &&
      !r.matches?.some(m => m.includes('copilot.microsoft.com')) &&
      !r.matches?.some(m => m.includes('perplexity.ai')) &&
      !r.matches?.some(m => m.includes('grok.com')) &&
      !r.matches?.some(m => m.includes('deepseek.com'))
  )
  if (manifest.web_accessible_resources.length === 0) {
    delete manifest.web_accessible_resources
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
console.log('✓ dist/manifest.json を更新しました')
console.log('  content_scripts:')
manifest.content_scripts.forEach(cs => {
  console.log(`    ${cs.matches.join(', ')} → ${cs.js.join(', ')}`)
})
