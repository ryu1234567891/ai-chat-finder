import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '../public/icons')

const TEAL        = '#1AB8A8'
const TEAL_DARK   = '#0E9688'
const OUTLINE     = '#1E1E1E'
const WHITE       = '#FFFFFF'
const EYE_BG      = '#FFFFFF'

// SVGデザイン（128x128 透明背景）
// 虫眼鏡＋ロボットアイ＋アンテナ
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">

  <!-- アンテナ -->
  <line x1="48" y1="6" x2="48" y2="20" stroke="${OUTLINE}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="48" cy="5" r="5" fill="${TEAL}" stroke="${OUTLINE}" stroke-width="2"/>

  <!-- 虫眼鏡の円（外枠） -->
  <circle cx="52" cy="58" r="44" fill="${OUTLINE}"/>
  <!-- 虫眼鏡の円（ティール塗り） -->
  <circle cx="52" cy="58" r="38" fill="${TEAL}"/>
  <!-- 虫眼鏡の円（内側の白い反射） -->
  <circle cx="52" cy="58" r="30" fill="${EYE_BG}"/>

  <!-- 目（虹彩） -->
  <circle cx="52" cy="58" r="20" fill="${TEAL_DARK}"/>
  <!-- 目（瞳孔） -->
  <circle cx="52" cy="58" r="10" fill="${OUTLINE}"/>
  <!-- 目（ハイライト） -->
  <circle cx="58" cy="50" r="5" fill="${WHITE}" opacity="0.8"/>

  <!-- 虫眼鏡のハンドル -->
  <line x1="86" y1="90" x2="114" y2="118" stroke="${OUTLINE}" stroke-width="16" stroke-linecap="round"/>
  <line x1="86" y1="90" x2="114" y2="118" stroke="${TEAL_DARK}" stroke-width="8" stroke-linecap="round"/>

</svg>
`.trim()

function generatePng(svgStr, size, outputPath) {
  const resvg = new Resvg(svgStr, {
    fitTo: { mode: 'width', value: size },
  })
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()
  writeFileSync(outputPath, pngBuffer)
  console.log(`✅ ${size}x${size} → ${outputPath}`)
}

generatePng(svg, 128, join(iconsDir, 'icon-128.png'))
generatePng(svg, 48,  join(iconsDir, 'icon-48.png'))
generatePng(svg, 16,  join(iconsDir, 'icon-16.png'))

console.log('🎨 アイコン生成完了！')
