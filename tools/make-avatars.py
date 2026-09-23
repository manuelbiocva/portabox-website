"""Crop square headshot avatars from the portrait PNGs.

The portraits are white-background RGB (alpha is uniformly 255), so the
subject is found by brightness, not transparency.

Framing: the crown sits only ~15px from the top of every source image, so a
generous square crop would run off the canvas and clamp, jamming the head
against the top edge — which a circular mask then clips. The canvas is
therefore padded with white first, and the crop is centred so the head sits
at ~46% of the frame with real headroom and a little shoulder.
"""
from PIL import Image
import os, statistics

SRC = 'site/assets/img'
PEOPLE = ['person-bridget.png', 'person-dean.png', 'person-steve.png']
OUT = 260
DARK = 26          # how far below white counts as subject
MIN_RUN = 14       # ignore specks
ZOOM = 2.45        # crop side as a multiple of head width
HEAD_AT = 0.46     # where the head's centre sits vertically in the crop

def longest_run(row):
    best = None; start = None
    for x, on in enumerate(row):
        if on:
            if start is None: start = x
        else:
            if start is not None and x - start >= MIN_RUN:
                if best is None or (x - start) > (best[1] - best[0]): best = (start, x)
            start = None
    if start is not None and len(row) - start >= MIN_RUN:
        if best is None or (len(row) - start) > (best[1] - best[0]): best = (start, len(row))
    return best

for name in PEOPLE:
    im = Image.open(os.path.join(SRC, name)).convert('RGB')
    w, h = im.size
    px = im.load()
    rowb = lambda y: [(255 - min(px[x, y])) > DARK for x in range(w)]

    crown = next((y for y in range(h) if longest_run(rowb(y))), None)
    if crown is None:
        print('  skip:', name); continue
    foot = next((y for y in range(h - 1, crown, -1) if longest_run(rowb(y))), h - 1)
    subj_h = max(foot - crown, 1)

    lo, hi = crown + int(subj_h * 0.05), crown + int(subj_h * 0.26)
    widths, centres = [], []
    for y in range(lo, max(hi, lo + 1)):
        e = longest_run(rowb(y))
        if e:
            widths.append(e[1] - e[0]); centres.append((e[0] + e[1]) // 2)
    if not widths:
        print('  skip (no head band):', name); continue

    head_w  = int(statistics.median(widths))
    head_cx = int(statistics.median(centres))
    # A head is roughly 1.35x as tall as it is wide, so its centre sits here.
    head_cy = crown + int(head_w * 0.67)

    side = int(head_w * ZOOM)

    # Pad with white so the crop never has to clamp against an edge.
    pad = side
    canvas = Image.new('RGB', (w + pad * 2, h + pad * 2), (255, 255, 255))
    canvas.paste(im, (pad, pad))

    cx = head_cx + pad
    cy = head_cy + pad
    x0 = cx - side // 2
    y0 = cy - int(side * HEAD_AT)

    crop = canvas.crop((x0, y0, x0 + side, y0 + side)).resize((OUT, OUT), Image.LANCZOS)
    out = os.path.join(SRC, name.replace('.png', '-avatar.jpg'))
    crop.save(out, 'JPEG', quality=90)
    print(f'  {name}: head w={head_w} centre=({head_cx},{head_cy}) -> {side}px crop, head at {int(HEAD_AT*100)}%')
