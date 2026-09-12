# Animation system

## Home cinematic

`CinematicHero` uses one normalized scroll progress across a sticky stage. GSAP ScrollTrigger owns the timeline; the canvas renderer receives only `0..1` progress. This separates art replacement from choreography.

- Intro exits during the early scrub.
- Narrative beat 1 enters, holds, exits.
- Beat 2 repeats the same grammar.
- Final statement enters before the stage releases.
- Canvas progress reverses naturally when scroll reverses.

The real-asset contract uses `NEXT_PUBLIC_HERO_FRAME_BASE`, with `{index}` and optional `{width}` placeholders. Desktop budget is 150 frames; mobile is 36. First 20 frames preload, remainder loads during idle. If no frame base exists, a procedural bottle renderer keeps the composition functional without pretending to be final product photography.

## Reduced motion

`prefers-reduced-motion: reduce` collapses the long cinematic section to one viewport and hides timeline-only narrative beats. Product information, navigation and buying controls remain present. Lenis is not initialized.

## Motion rules

Use transform/opacity for UI motion; no bounce/elastic language; micro-interactions are typically 250–450ms with `cubic-bezier(.16,1,.3,1)`. Long narrative scrub is progress-driven rather than duration-driven. Motion never locks body overflow or makes a required control hover-only.
