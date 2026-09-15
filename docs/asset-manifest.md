# Asset manifest / replacement contract

| Asset | Current | Production requirement |
|---|---|---|
| Core bottle images | Client-supplied posters (interim, WhatsApp-compressed) at `public/products/relapse/*.webp` | approved studio front/3-quarter bottle renders, consistent light/backdrop, AVIF/WebP, full resolution |
| Discovery set | real client photograph (`discovery-set.webp`) | full-resolution original when available |
| Home hero | interim cinematic render sequence (faceted house flacon, 150/60 frames) | 6s centered bottle turntable frame sequence from the client's studio shoot |
| PDP scale | reused placeholder bottle | in-hand or known-object photograph |
| OG | placeholder brand artwork | generated per scent using approved bottle + accent token |

Hero frame naming is configured rather than hard-coded. Example:

```env
NEXT_PUBLIC_HERO_FRAME_BASE=/cinematic/invictus/{width}/frame-{index}.webp
```

Prepare 1600px and 960px sets. Use four-digit one-based frame indexes (`0001` …). Keep a poster/LCP image independent from the full sequence when final assets arrive.

The current sequence is an interim 3D render of the house flacon (structure modelled
from the client's macro poster reference). Sources and regeneration scripts:
`tools/hero-render/`.
