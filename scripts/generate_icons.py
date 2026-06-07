"""
SVG → PNG アイコン生成スクリプト
cairosvg を使って高品質な PNG を出力する。
"""

import sys
import os

# cairosvg がシステム Python にインストールできない場合の fallback パス
_PYLIBS = '/tmp/claude/pylibs'
if _PYLIBS not in sys.path:
    sys.path.insert(0, _PYLIBS)

import cairosvg

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS_DIR = os.path.join(ROOT, 'public', 'icons')

# ─────────────────────────────────────────────────────────────────────────────
# SVG 定義（viewBox 0 0 128 128 で統一）
# ─────────────────────────────────────────────────────────────────────────────

SVG_128 = '''\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <!-- 背景グラデーション: 左上インディゴ → 右下パープル -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
    <!-- レンズのガラス感 -->
    <radialGradient id="lens" cx="35%" cy="35%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
    </radialGradient>
    <!-- 目の発光感 -->
    <radialGradient id="eyeGlow" cx="50%" cy="50%">
      <stop offset="0%"   stop-color="#67e8f9"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </radialGradient>
  </defs>

  <!-- ── 背景 角丸正方形 ── -->
  <rect x="0" y="0" width="128" height="128" rx="20" ry="20" fill="url(#bg)"/>

  <!-- ── アンテナ ── -->
  <!-- 軸 -->
  <line x1="64" y1="26" x2="64" y2="38" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  <!-- 先端の発光球 -->
  <circle cx="64" cy="22" r="5" fill="#22d3ee" opacity="0.95"/>
  <circle cx="64" cy="22" r="3" fill="#ffffff" opacity="0.6"/>

  <!-- ── 耳（左右） ── -->
  <rect x="22" y="50" width="6" height="12" rx="3" ry="3" fill="#e2e8f0"/>
  <rect x="100" y="50" width="6" height="12" rx="3" ry="3" fill="#e2e8f0"/>

  <!-- ── 頭（白い角丸長方形） ── -->
  <rect x="29" y="38" width="70" height="52" rx="14" ry="14" fill="#ffffff"/>

  <!-- ── 目（左）── -->
  <circle cx="50" cy="62" r="9" fill="url(#eyeGlow)"/>
  <!-- 光点 -->
  <circle cx="54" cy="57" r="2.5" fill="#ffffff" opacity="0.9"/>

  <!-- ── 目（右）── -->
  <circle cx="78" cy="62" r="9" fill="url(#eyeGlow)"/>
  <!-- 光点 -->
  <circle cx="82" cy="57" r="2.5" fill="#ffffff" opacity="0.9"/>

  <!-- ── 口（薄グレーの角丸長方形）── -->
  <rect x="54" y="77" width="20" height="6" rx="3" ry="3" fill="#e2e8f0"/>

  <!-- ── 輝きマーク（左上）── -->
  <g opacity="0.55" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round">
    <line x1="36" y1="44" x2="36" y2="48"/>
    <line x1="34" y1="46" x2="38" y2="46"/>
  </g>
  <!-- ── 輝きマーク（右下）── -->
  <g opacity="0.55" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round">
    <line x1="90" y1="84" x2="90" y2="88"/>
    <line x1="88" y1="86" x2="92" y2="86"/>
  </g>

  <!-- ── 虫眼鏡（右下、ロボット頭に重なる）── -->
  <!-- レンズ（ガラス感塗り） -->
  <circle cx="95" cy="99" r="14" fill="url(#lens)"/>
  <!-- レンズ（輪郭） -->
  <circle cx="95" cy="99" r="14" fill="none" stroke="#ffffff" stroke-width="3.5"/>
  <!-- ハンドル（右下45度） -->
  <line x1="105" y1="109" x2="116" y2="120"
        stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
</svg>
'''

# 16px 専用: 細かい要素を省いて目だけ強調
SVG_16 = '''\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="16" height="16">
  <defs>
    <linearGradient id="bg16" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <!-- 背景 -->
  <rect x="0" y="0" width="128" height="128" rx="20" ry="20" fill="url(#bg16)"/>
  <!-- 頭 -->
  <rect x="24" y="36" width="80" height="58" rx="16" ry="16" fill="#ffffff"/>
  <!-- 目（左）大きめ -->
  <circle cx="50" cy="64" r="12" fill="#22d3ee"/>
  <circle cx="56" cy="58" r="4"  fill="#ffffff" opacity="0.85"/>
  <!-- 目（右）大きめ -->
  <circle cx="78" cy="64" r="12" fill="#22d3ee"/>
  <circle cx="84" cy="58" r="4"  fill="#ffffff" opacity="0.85"/>
</svg>
'''

# ─────────────────────────────────────────────────────────────────────────────

def export(svg_src: str, size: int, path: str) -> None:
    cairosvg.svg2png(
        bytestring=svg_src.encode(),
        write_to=path,
        output_width=size,
        output_height=size,
    )
    print(f'  ✓ {os.path.basename(path)} ({size}×{size})')


if __name__ == '__main__':
    os.makedirs(ICONS_DIR, exist_ok=True)
    print('アイコン生成中...')
    export(SVG_128, 128, os.path.join(ICONS_DIR, 'icon-128.png'))
    export(SVG_128,  48, os.path.join(ICONS_DIR, 'icon-48.png'))
    export(SVG_16,   16, os.path.join(ICONS_DIR, 'icon-16.png'))
    print('完了')
