
import struct, zlib, os, math

BASE = r"d:\Develop\VScode Project\Java\smart-campus-wxapp\assets\icons"
os.makedirs(BASE, exist_ok=True)

W, H = 81, 81

def make_png(pixels):
    raw = b""
    for row in range(H):
        raw += b"\x00"
        for col in range(W):
            r,g,b,a = pixels[row*W + col]
            raw += bytes([r,g,b,a])
    compressed = zlib.compress(raw, 9)
    def chunk(name, data):
        c = name + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed) + chunk(b"IEND", b"")

TRANSPARENT = (0,0,0,0)
C_GRAY  = (138,138,138,255)
C_GREEN = (26,173,25,255)

def empty():
    return [TRANSPARENT] * (W*H)

def px(c,r): return c + r*W

def circle(cx,cy,r,pix,color):
    for row in range(max(0,cy-r-1), min(H,cy+r+2)):
        for col in range(max(0,cx-r-1), min(W,cx+r+2)):
            if (col-cx)**2+(row-cy)**2 <= r**2:
                pix[px(col,row)] = color

def rect(x1,y1,x2,y2,pix,color):
    for row in range(max(0,y1), min(H,y2+1)):
        for col in range(max(0,x1), min(W,x2+1)):
            pix[px(col,row)] = color

def draw_home(color):
    p = empty()
    cx = W//2
    # 屋顶三角
    for row in range(14, 44):
        t = (row-14)/30.0
        left  = int(cx - 30*t)
        right = int(cx + 30*t)
        for col in range(left, right+1):
            if 0<=col<W: p[px(col,row)] = color
    # 主体
    rect(18,42,63,66,p,color)
    # 门洞
    for row in range(49,67):
        for col in range(cx-9,cx+10):
            if 0<=col<W and 0<=row<H: p[px(col,row)] = TRANSPARENT
    # 烟囱
    rect(49,20,57,38,p,color)
    return p

def draw_course(color):
    p = empty()
    # 左页
    rect(12,14,36,67,p,color)
    # 右页
    rect(45,14,69,67,p,color)
    # 书脊
    rect(37,12,44,69,p,(80,80,80,200) if color==C_GRAY else (15,110,14,255))
    # 白线纹路
    wl = (255,255,255,150)
    for ly in [26,34,42,50,58]:
        for col in range(15,35): p[px(col,ly)] = wl
        for col in range(47,68): p[px(col,ly)] = wl
    return p

def draw_notice(color):
    p = empty()
    cx = W//2
    # 铃身
    for row in range(20, 58):
        ratio = (row-20)/38.0
        hw = int(26 * math.sin(ratio * math.pi * 0.85 + 0.15))
        for col in range(cx-hw, cx+hw+1):
            if 0<=col<W: p[px(col,row)] = color
    # 底横
    rect(cx-28,56,cx+28,62,p,color)
    # 顶杆
    rect(cx-3,12,cx+3,22,p,color)
    # 铃舌
    circle(cx,68,8,p,color)
    # 顶部小圆弧（装饰）
    circle(cx,14,4,p,color)
    return p

def draw_profile(color):
    p = empty()
    cx = W//2
    # 头
    circle(cx,27,15,p,color)
    # 身体
    for row in range(47,71):
        t = (row-47)/24.0
        hw = int(16 + 12*t)
        for col in range(cx-hw, cx+hw+1):
            if 0<=col<W: p[px(col,row)] = color
    return p

icons = {
    "home":    draw_home,
    "course":  draw_course,
    "notice":  draw_notice,
    "profile": draw_profile,
}

for name, fn in icons.items():
    for suffix, color in [("", C_GRAY), ("_active", C_GREEN)]:
        path = os.path.join(BASE, f"{name}{suffix}.png")
        with open(path, "wb") as f:
            f.write(make_png(fn(color)))
        print(f"OK  {path}")

print("Done.")
