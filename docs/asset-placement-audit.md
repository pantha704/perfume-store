# Client Asset Placement Audit — RELAPSE Perfumes

Source of truth: the exported client WhatsApp conversation (identifying details
withheld) plus the media recovered from the client's WhatsApp Web media cache on
2026-09-13. The raw originals are retained privately by the maintainer and are
deliberately absent from this repository; production derivatives live in `public/`.

Note on fidelity: recovered media is WhatsApp-compressed (max ~1600 px). The client
should still provide the original full-resolution files for print/HD use.

## Placement table

| # | Original file | Type / dims | Context (chat) | Intended use | Production output | Status |
|---|---|---|---|---|---|---|
| 1 | 01-brand/relapse-logo.jpg | JPG 1440×1440 | Client brand wordmark (multiple uses) | Brand identity | `public/brand/relapse-logo.webp`; site rebranded VELORA → RELAPSE | USED |
| 2 | 01-brand/relapse-branded-folder.jpg | JPG 1600×900 | Packaging/folder photo | Packaging reference | — | REFERENCE ONLY |
| 3 | 01-brand/name-card-invictus.jpg | JPG 764×324 | Product title card | Product branding | — | REFERENCE ONLY |
| 4 | 01-brand/name-card-whisky-smoke.jpg | JPG 760×328 | Product title card | Product branding | — | REFERENCE ONLY |
| 5 | 01-brand/name-card-velvet-bloom.jpg | JPG 764×328 | Product title card | Product branding | — | REFERENCE ONLY |
| 6 | 01-brand/name-card-sandalwood.jpg | JPG 756×320 | Product title card | Product branding | — | REFERENCE ONLY |
| 7 | 01-brand/name-card-boldmove.jpg | JPG 768×328 | Product title card | Product branding | — | REFERENCE ONLY |
| 8 | 02-posters/poster-invictus-luxury.jpg | JPG 899×1599 | Sep 5–6 albums; "THE SCENT OF LUXURY" | Invictus product visual | `public/products/relapse/invictus.webp` | USED |
| 9 | 02-posters/poster-velvet-bloom.jpg | JPG 1080×1350 | Sep 5–6 albums | Velvet Bloom product visual | `public/products/relapse/velvet-bloom.webp` | USED |
| 10 | 02-posters/poster-whisky-smoke.jpg | JPG 1131×1600 | Sep 5–6 albums | Whisky Smoke product visual | `public/products/relapse/whisky-smoke.webp` | USED |
| 11 | 02-posters/poster-boldmove.jpg | JPG 1024×1309 | Sep 5–6 albums | Bold Move product visual | `public/products/relapse/bold-move.webp` | USED |
| 12 | 02-posters/poster-sandalwood-1.jpg | JPG 1080×1440 | Sep 5–6 albums | Sandalwood product visual | `public/products/relapse/sandalwood.webp` | USED |
| 13 | 02-posters/poster-sandalwood-story.jpg | JPG 899×1599 | Sep 5–6 albums | Alternative Sandalwood art | — | REFERENCE ONLY |
| 14 | 02-posters/catalog-card-all-five-products.jpg | JPG 896×1200 | "EMBRACE THE EVERYDAY"; AI-generated content watermark visible | Product list + summary copy | copy mined into catalogue data | REFERENCE ONLY (AI-generated artwork; note text superseded by chat notes) |
| 15 | 03-product-photos/lineup-sprays-and-bottles.jpg | JPG 1366×768 | Product lineup photo | Collection/studio shot | — | REFERENCE ONLY (candidate for shop/hero band later) |
| 16 | 03-product-photos/lineup-white-bg.jpg | JPG 1366×768 | Product lineup photo | Collection/studio shot | — | REFERENCE ONLY |
| 17–21 | 03-product-photos/bottle-and-travel-spray-1..5.jpg | JPG 1600×900 | Studio shots, round bottle + travel spray | Product photography | — | AMBIGUOUS — product identity not confirmed from context (label reads brand only); needs client confirmation before placement |
| 22 | 03-product-photos/discovery-set-case.jpg | JPG 900×1600 | Five-spray case photo | Discovery Set product visual | `public/products/relapse/discovery-set.webp` | USED |
| 23 | 04-video-audio/video-01.mp4 | MP4 474×850, 3.6 s | Handheld unboxing (black box, gold emblem, spray inside) | Social/unboxing reference | — | REFERENCE ONLY — not suitable as cinematic hero (portrait, handheld, 474 px wide) |
| 24 | 04-video-audio/voice-note.ogg | Opus audio | Sep 8 conversation about Amazon/order integration | Business context | — | UNUSED (context only) |
| 25 | 04-video-audio/video-thumb-1.jpg | JPG 361×640 | Video thumbnail (promo, person holding product) | — | — | REFERENCE ONLY — source video missing |
| 26 | 04-video-audio/video-thumb-2.jpg | JPG 361×640 | Video thumbnail | — | — | REFERENCE ONLY — source video missing |
| 27–41 | 99-other-received/* | mixed | personal/status media, stickers, UI icons | — | — | UNUSED |

## Replacements made in the repository

- Product visuals: all six placeholder SVGs replaced in data (`invictus`, `velvet-bloom`,
  `whisky-smoke`, `bold-move`, `sandalwood`, `discovery-set`).
- Catalogue: names, slugs, note pyramids and short copy now based on client material.
  Slugs changed: `nocturne-01`→`invictus`, `sandalwood-atelier`→`sandalwood`,
  `whiskey-smoke`→`whisky-smoke`, `boldmove`→`bold-move`.
- Brand: VELORA → RELAPSE (wordmark, metadata, footer, about, payment sheet name, canvas label).
  Tagline adopted from the client's own catalogue card: *"Embrace the everyday."*
- Hero fallback label updated (RELAPSE / INVICTUS); E2E tests updated to the new slug.

## Still placeholder / missing client input

| Item | Status |
|---|---|
| Prices, MRP, GST treatment | MISSING — current values are demo placeholders, not client data |
| SKUs, sizes (ml), weights | MISSING — current values are demo placeholders |
| Concentration per product | NOT SUPPLIED (site uses Eau de Parfum / Extrait demo values) |
| Solo studio photo per product | PARTIAL — posters used as interim product visuals; studio shots requested |
| Cinematic hero (6 s turntable + macro, 1920/960 frames) | MISSING — client video is an unboxing clip; keep existing fallback |
| Scale-reference imagery per bottle | MISSING |
| OG image | still placeholder `/og.svg` |
| Legal/business: returns, shipping, privacy, terms, support contacts, merchant details | MISSING (pages remain placeholder-labelled) |
| "Invictus" name trademark clearance | REQUIRES CLIENT DECISION (also a Paco Rabanne fragrance name) |
| Velvet Bloom note discrepancy | card says "Damask Rose, Musk"; chat notes say jasmine bud/tuberose/Rangoon Creeper — chat version used; confirm final label copy |
| Wholesale/order integration (Amazon account) | PENDING client decision (from Sept 8 conversation) |

## Screenshots / QA

See the integration report (session output) for desktop + mobile captures of
homepage, shop, each PDP, samples, cart and checkout after replacement.
