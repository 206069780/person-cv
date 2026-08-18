# Exhibition Page Override

This page-level file overrides `../MASTER.md` for the final web exhibition. The generated Bento/light palette is not used because the approved direction is a full-screen cinematic 3D museum.

## Approved Direction

- Style: cinematic industrial digital twin with realistic architecture and restrained sci-fi instrumentation.
- Composition: full-bleed Three.js scene; no framed hero, card wall, marketing split hero, decorative orb, or SVG hero illustration.
- Narrative: 6-8 second interruptible arrival sequence, then free exploration with visible project navigation.
- Agent room: the only zone allowed to use stronger cyber/HUD effects.

## Color Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--museum-bg` | `#030708` | Deep environment background |
| `--museum-surface` | `#0A1113` | UI overlays and readable panels |
| `--museum-steel` | `#26343A` | Architecture, dividers and neutral borders |
| `--museum-signal` | `#62E8CF` | Water/data flow and active navigation |
| `--museum-safety` | `#FF6B3D` | Primary actions and key evidence |
| `--museum-text` | `#ECF5F2` | Primary dark-mode text |
| `--museum-muted` | `#93A8A2` | Secondary text |

Do not use purple/pink gradients or a monochromatic blue palette. Cyan and orange must remain accents against graphite, steel and neutral text.

## Typography

- Chinese headings and body: `Noto Sans SC`, system sans-serif fallback.
- Technical labels and telemetry: `IBM Plex Mono`, monospace fallback.
- Body text stays at 16px minimum on mobile with 1.6 line height.
- Letter spacing is `0`; hierarchy comes from weight, scale and spacing.

## Shape And Components

- Panels use 0-4px radius; avoid rounded marketing cards and cards nested inside cards.
- Icon buttons use Lucide with tooltips and visible focus rings.
- Interactive targets are at least 44×44px with pressed and keyboard states.
- The mini-map, project index and PDF action use stable dimensions so dynamic labels cannot shift layout.

## Motion

- Intro camera sequence: 6-8 seconds, GSAP `expo.inOut`, immediately interruptible.
- UI transitions: 160-260ms using transform and opacity only.
- Scene motion communicates live water/data flow; limit decorative particles and bloom.
- Respect `prefers-reduced-motion` and provide a stable non-WebGL path.

## Performance And Accessibility

- Lazy-load side rooms and compressed 3D assets.
- Scale pixel ratio, shadows, reflections, bloom and particles by device capability.
- Keep resume content available as semantic HTML outside the Canvas.
- Support keyboard navigation, visible focus, skip intro and predictable return to the central hall.
- Mobile first shows the desktop-experience notice, then renders the complete vertical resume without heavy 3D.
