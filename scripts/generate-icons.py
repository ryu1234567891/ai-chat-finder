"""プレースホルダーアイコンを生成するスクリプト（ビルド前に一度実行）"""

import struct
import zlib
import os


def create_png(width: int, height: int, bg_color=(79, 70, 229), text_color=(255, 255, 255)):
    """指定サイズの単色PNGを生成"""

    def make_chunk(name: bytes, data: bytes) -> bytes:
        body = name + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    # PNGシグネチャ
    png = b"\x89PNG\r\n\x1a\n"

    # IHDR: 幅・高さ・ビット深度8・カラータイプ2(RGB)
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    png += make_chunk(b"IHDR", ihdr_data)

    # IDAT: ピクセルデータ（各行の先頭にフィルタバイト0を追加）
    raw = b""
    for y in range(height):
        raw += b"\x00"
        for x in range(width):
            # 中央付近に十字形の白マークを描画
            cx, cy = width // 2, height // 2
            in_cross = (abs(x - cx) <= width // 8 or abs(y - cy) <= height // 8) and (
                abs(x - cx) <= width // 3 and abs(y - cy) <= height // 3
            )
            raw += bytes(text_color if in_cross else bg_color)

    png += make_chunk(b"IDAT", zlib.compress(raw))
    png += make_chunk(b"IEND", b"")
    return png


os.makedirs("public/icons", exist_ok=True)

for size in [16, 48, 128]:
    path = f"public/icons/icon-{size}.png"
    with open(path, "wb") as f:
        f.write(create_png(size, size))
    print(f"生成: {path}")

print("完了！")
