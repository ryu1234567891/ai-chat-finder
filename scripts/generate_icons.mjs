/**
 * SVG → PNG アイコン生成スクリプト
 * @resvg/resvg-js (WASM) を使用 — システムライブラリ不要
 *
 * コンセプト:「ロボットが片目に虫眼鏡を当てていて、その目が拡大して見えている」
 * 配色: 暖色ポップ / オレンジ #f97316 → ピンク #ec4899
 */

import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ICONS_DIR = resolve(__dirname, '..', 'public', 'icons')
mkdirSync(ICONS_DIR, { recursive: true })

// ─────────────────────────────────────────────────────────────────────────────
// フルサイズSVG (128×128, 48pxにも流用)
// ─────────────────────────────────────────────────────────────────────────────
// レイアウトメモ:
//   頭:   x=28, y=36, w=72, h=48 (右端x=100, 中心y=60)
//   左目: cx=47, cy=58  r=7  (通常サイズ)
//   右目: 虫眼鏡 cx=85, cy=55  r=15 (レンズ)、中の目 r=11 (1.57倍)
//         ハンドルはレンズ右下45°から外へ伸びる
//   口:   M 43,75 Q 52,83 61,75  (虫眼鏡と逆・左寄り)
//   アンテナ: (64,36)→(64,26), 先端(64,22) r=3

const SVG_FULL = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <!-- 背景グラデーション: オレンジ→ピンク 左上→右下 -->
    <linearGradient id="bg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <!-- 目の塗り（共通）-->
    <radialGradient id="eyeGrad" cx="38%" cy="32%" r="65%">
      <stop offset="0%"   stop-color="#67e8f9"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </radialGradient>
    <!-- 拡大された目（同じ色調だが中心を少し明るく）-->
    <radialGradient id="bigEyeGrad" cx="38%" cy="32%" r="65%">
      <stop offset="0%"   stop-color="#a5f3fc"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </radialGradient>
    <!-- アンテナ先端グロー -->
    <filter id="glow" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- ── 1. 背景 ── -->
  <rect x="0" y="0" width="128" height="128" rx="24" ry="24" fill="url(#bg)"/>

  <!-- ── 2. アンテナ ── -->
  <line x1="64" y1="26" x2="64" y2="36"
        stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.92"/>
  <!-- グロー（背面レイヤー） -->
  <circle cx="64" cy="22" r="6" fill="#22d3ee" opacity="0.45" filter="url(#glow)"/>
  <!-- 先端球体 -->
  <circle cx="64" cy="22" r="3"   fill="#22d3ee"/>
  <circle cx="64" cy="22" r="1.4" fill="#ffffff" opacity="0.82"/>

  <!-- ── 3. 耳（白、頭と自然につながる） ── -->
  <rect x="23"  y="51" width="5" height="10" rx="2.5" fill="#ffffff"/>
  <rect x="100" y="51" width="5" height="10" rx="2.5" fill="#ffffff"/>

  <!-- ── 4. 頭（白い角丸長方形） ── -->
  <rect x="28" y="36" width="72" height="48" rx="14" ry="14" fill="#ffffff"/>

  <!-- ── 5. 左目（通常・小さめ） ── -->
  <circle cx="47" cy="58" r="7"   fill="url(#eyeGrad)"/>
  <!-- 光点（右上）-->
  <circle cx="51" cy="53.5" r="2" fill="#ffffff" opacity="0.95"/>
  <!-- 光点（左下）-->
  <circle cx="44" cy="61.5" r="1" fill="#ffffff" opacity="0.5"/>

  <!-- ── 6. 右目・虫眼鏡アセンブリ ──
       レンズ cx=85 cy=55 r=15
       → ハンドル: エッジ(85+10.6, 55+10.6)=(95.6,65.6) + 14px方向 →(105.5,75.5)
  ── -->
  <!-- ガラス感（塗り、内側の目より下のレイヤー）-->
  <circle cx="85" cy="55" r="15" fill="#ffffff" fill-opacity="0.18"/>
  <!-- 拡大された目（レンズ内） -->
  <circle cx="85" cy="55" r="11" fill="url(#bigEyeGrad)"/>
  <!-- 光点・大（右上）-->
  <circle cx="91"   cy="49"   r="3"   fill="#ffffff" opacity="0.95"/>
  <!-- 光点・小（左下）-->
  <circle cx="81.5" cy="60.5" r="1.5" fill="#ffffff" opacity="0.55"/>
  <!-- レンズ輪郭（最前面で内側要素を縁取る）-->
  <circle cx="85" cy="55" r="15" fill="none" stroke="#ffffff" stroke-width="3.5"/>
  <!-- ハンドル -->
  <line x1="96" y1="66" x2="107" y2="77"
        stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>

  <!-- ── 7. 口（にっこりスマイル、左寄り） ── -->
  <path d="M 43,75 Q 52,83 61,75"
        stroke="#cbd5e1" stroke-width="2.5" fill="none" stroke-linecap="round"/>

  <!-- ── 8. キラキラ（頭の左上に1個だけ）── -->
  <g opacity="0.62" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round">
    <line x1="37" y1="43" x2="37" y2="47"/>
    <line x1="35" y1="45" x2="39" y2="45"/>
  </g>
</svg>
`

// ─────────────────────────────────────────────────────────────────────────────
// 16px専用SVG: 「大きな水色ドット（拡大目）+ 小さな水色ドット（通常目）」を強調
// ─────────────────────────────────────────────────────────────────────────────
const SVG_16 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg16" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <radialGradient id="eye16" cx="38%" cy="32%" r="65%">
      <stop offset="0%"   stop-color="#a5f3fc"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </radialGradient>
  </defs>

  <!-- 背景 -->
  <rect x="0" y="0" width="128" height="128" rx="24" ry="24" fill="url(#bg16)"/>
  <!-- 頭（広め）-->
  <rect x="18" y="36" width="92" height="58" rx="16" ry="16" fill="#ffffff"/>
  <!-- 小さい左目 -->
  <circle cx="44"  cy="65" r="13" fill="url(#eye16)"/>
  <circle cx="49"  cy="59" r="4"  fill="#ffffff" opacity="0.88"/>
  <!-- 大きい右目（拡大・虫眼鏡を通した目） -->
  <circle cx="84"  cy="63" r="21" fill="url(#eye16)"/>
  <circle cx="92"  cy="55" r="6.5" fill="#ffffff" opacity="0.88"/>
</svg>
`

// ─────────────────────────────────────────────────────────────────────────────

function exportPng(svgStr, size, filename) {
  const resvg = new Resvg(svgStr, {
    fitTo: { mode: 'width', value: size },
    font: { loadSystemFonts: false },
  })
  const png = resvg.render().asPng()
  const outPath = resolve(ICONS_DIR, filename)
  writeFileSync(outPath, png)
  console.log(`  ✓ ${filename} (${size}×${size})`)
}

console.log('アイコン生成中...')
exportPng(SVG_FULL, 128, 'icon-128.png')
exportPng(SVG_FULL,  48, 'icon-48.png')
exportPng(SVG_16,    16, 'icon-16.png')
console.log('完了')
