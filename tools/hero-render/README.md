# Hero render pipeline (interim cinematic sequence)

The home hero scrubs a pre-rendered frame sequence (see `docs/animation-system.md`).
The current sequence is an interim 3D render of the house flacon — its structure was
modelled from the client's macro poster reference (faceted amber slab, ribbed silver
crimp collar, black pump stack, faceted crystal cap). When the client's real studio
turntable arrives, it replaces this at the same asset contract.

## Scripts

| File | Purpose |
|---|---|
| `hero_scene.py` | Builds the bottle / table / lighting scene (Blender 4.5 LTS, headless). |
| `render_frames.py` | Scroll choreography + frame renderer. Modes: `preview`, `stills`, `desktop`, `mobile`. |
| `to_webp.py` | PNG → WebP with feathered alpha edges (melts into the site's dark backdrop). |

## Prerequisites

- Blender 4.5 LTS (headless works; OptiX if an NVIDIA GPU is present, else CUDA/CPU).
- Asset inputs next to the scripts (kept out of the repo to stay light):
  - `textures/dark_wood_diff_2k.jpg` — any CC0 dark hardwood diffuse texture.
  - `hdri/photo_studio_01_2k.hdr` — any CC0 studio HDRI.
  - Any file names are fine; update the paths in `hero_scene.py` if they differ.

## Run

```bash
blender -b --factory-startup --python render_frames.py -- preview   # 9 key poses, fast look check
blender -b --factory-startup --python render_frames.py -- stills    # 4 full-quality stills
blender -b --factory-startup --python render_frames.py -- desktop   # 150 frames @ 1600px
blender -b --factory-startup --python render_frames.py -- mobile    # 60 frames @ 960px

python3 to_webp.py --src renders/desk-1600 --dst ../../public/cinematic/invictus/1600 --width 1600
python3 to_webp.py --src renders/mob-960  --dst ../../public/cinematic/invictus/960  --width 960
```

## Asset contract

- `public/cinematic/invictus/1600/frame-0001..0150.webp` (desktop)
- `public/cinematic/invictus/960/frame-0001..0060.webp` (mobile)
- Wired via `NEXT_PUBLIC_HERO_FRAME_BASE=/cinematic/invictus/{width}/frame-{index}.webp`
- Frames carry alpha with a soft edge feather; the canvas composites them over the
  page's dark radial backdrop.
