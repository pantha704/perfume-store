#!/usr/bin/env python3
"""Convert rendered PNG frames to web-ready WebP with feathered alpha edges.

Usage:
  python3 to_webp.py --src <dir> --dst <dir> --width 1600 [--feather 0.10] [--quality 88]

The alpha feather makes the table/bottle melt into the site's dark backdrop
instead of ending on a visible frame edge.
"""
import argparse, os, sys
from PIL import Image
import numpy as np


def smoothstep(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3 - 2 * t)


def edge_mask(w, h, feather):
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy)).astype(np.float32)
    d /= max(1.0, feather * min(w, h))
    return smoothstep(d)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--dst", required=True)
    ap.add_argument("--width", type=int, default=1600)
    ap.add_argument("--feather", type=float, default=0.10)
    ap.add_argument("--quality", type=int, default=88)
    args = ap.parse_args()

    os.makedirs(args.dst, exist_ok=True)
    names = sorted(f for f in os.listdir(args.src) if f.endswith(".png"))
    if not names:
        sys.exit(f"no PNGs in {args.src}")
    total = 0
    for i, name in enumerate(names):
        img = Image.open(os.path.join(args.src, name)).convert("RGBA")
        if args.width and img.width != args.width:
            img = img.resize((args.width, args.width), Image.LANCZOS)
        arr = np.asarray(img).astype(np.float32)
        m = edge_mask(img.width, img.height, args.feather)
        arr[..., 3] *= m
        out = Image.fromarray(arr.clip(0, 255).astype(np.uint8), "RGBA")
        dst = os.path.join(args.dst, name.replace(".png", ".webp"))
        out.save(dst, "WEBP", quality=args.quality, method=6, alpha_quality=100)
        total += os.path.getsize(dst)
        if (i + 1) % 25 == 0 or i == len(names) - 1:
            print(f"{i + 1}/{len(names)} frames, running total {total / 1e6:.1f} MB", flush=True)
    print(f"DONE {len(names)} frames -> {args.dst} ({total / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
