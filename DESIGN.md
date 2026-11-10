---
version: alpha
name: AstroPulse
description: A crew anatomy explorer shaped like a spacecraft observation bay.
colors:
  background: "#0B132B"
  surface: "#1C2541"
  border: "#3A506B"
  primary: "#5BC0DE"
  foreground: "#EDF3F8"
  secondary: "#F4D6B0"
typography:
  display:
    fontFamily: "Chakra Petch, sans-serif"
  sans:
    fontFamily: "IBM Plex Sans, sans-serif"
  mono:
    fontFamily: "IBM Plex Mono, monospace"
rounded:
  DEFAULT: "0.75rem"
  control: "0.5rem"
spacing:
  panel: "1.5rem"
  gap: "1rem"
components:
  button:
    rounded: "0.5rem"
    textColor: foreground
    backgroundColor: background
  sidebar:
    width: "22rem"
---

# AstroPulse design system

## Overview

Product register: an English-language crew-health visualization prototype for Space Apps participants. The single job is to explore body-system sample readings through a real astronaut/anatomy model. The user brief is authoritative; the sibling crew-health project's navy/cyan/sand palette provides continuity. This repository started with only a title, without routes, components, or a backend.

The signature is a full-height observation bay: a large illuminated human figure, restrained height ticks, and a small contextual selection readout. Avoid dashboard card mosaics, animated or dense space particles, fake live telemetry, and assistant overlays that cover the model. The aesthetic risk is dedicating most of the screen to the figure rather than metrics.

Initial concept compared a floating assistant overlay with a fixed inspector. The overlay was rejected because it obscures the model and shifts visual focus. The fixed inspector switches content without moving the bay.

Runtime ownership: `src/styles.css` is the canonical CSS token source, mirrored by this document. CSS consumers use semantic variables. `src/viewer.tsx` uses explicit scene-light/material colors; these are lighting/art-direction values, not duplicate UI tokens. All app content is English; no Japan-market scope is asserted. Readings, responses, and voice are explicitly simulated and stay local.

## Colors

Background navy #0B132B, panel navy #1C2541, structural slate #3A506B, interactive cyan #5BC0DE, readable ice #EDF3F8, and quiet sand #F4D6B0. Selection uses cyan plus a visible label and border. Secondary text uses ice at sufficient contrast. Errors use text and a border, not a color-only indication. One dark theme, with forced-color support.

## Typography

Chakra Petch brings restrained instrument-panel geometry to headings and the wordmark. IBM Plex Sans carries body copy and controls; IBM Plex Mono carries measurements and technical captions. Self-host Latin WOFF2 with swap and stable reserved regions. Body 15px/1.55; heading 32px; readings 38px; labels 11px. Sentence case for actions; uppercase only for compact instrument captions.

## Layout

```text
brand / crew explorer                        prototype
body-system rail | large shared 3D bay | Body / AI Agent
                 |                    | selected readings
                 | rotation controls  | contextual details
source credits / demo disclosure
```

Desktop grid: 13rem system rail, flexible bay, 22rem inspector. Below 1100px the rail becomes a horizontal wrapping control group. Below 720px the inspector sits below a reserved 510px bay. The document owns scrolling; do not hide overflowing page content. Sidebar mode never changes viewer width. A 16px gap and 24px panel rhythm leave breathing room around dense controls. The stage does not unmount when modes change.

## Elevation & Depth

User-approved polish (2026-11-10): frost the existing header, inspector, suit toggle and toolbar without adding cards or changing the three-column layout. Preserve all six palette colors and existing type roles. Static blue lighting on the page creates visible tonal variation behind the glass; subtle inner rims and soft shadows express surface thickness. Keep the model and its lights unchanged.

Runtime glass tokens in `src/styles.css`: navy surface rgba(17,31,53,0.66), pale border rgba(168,211,237,0.23), inner highlight rgba(222,242,255,0.10), 22px backdrop blur (16px on the mobile inspector), and shadow 0 14px 36px rgba(2,8,23,0.22). Local surface-alpha variants are explicitly scoped to header, toggle, toolbar and dialog. No CSS filter or backdrop blur applies to the Canvas or its container. Unsupported blur, reduced transparency and increased contrast receive opaque surfaces.

The star field is 88 deterministic, static DOM points behind the transparent canvas: predominantly subpixel/dim, six slightly brighter, lower contrast behind the central silhouette. It adds no WebGL draw calls, event handlers, animation or raycasts. `pointer-events: none` and `aria-hidden` keep it decorative. Stars persist in both model modes. Scene z-index 1 is above sky 0; header/toggle use chrome 2; About uses the browser modal top layer. Loading and error messages retain their existing geometry.

## Shapes

12px panel corners and 8px controls. Pill labels only for prototype/demo captions. Icons are Lucide outlines at 18–20px with text labels or accessible names.

## Components

Shared button styles own hover, pressed, disabled, and 2px cyan focus. Use native buttons with aria-pressed for the two mode selectors. The persistent sidebar is non-modal. About uses a compact native `<dialog>` with application-owned styling, an accessible title/description, initial close-button focus, modal background isolation, Escape dismissal, scroll locking and trigger focus restoration. No tables, dates, search, CRUD, or remote mutations apply.

Canonical UI map: buttons and scrollbar → `src/styles.css`; application selection/sidebar/voice state → `src/App.tsx`; viewer loading/error/retry/camera → `src/viewer.tsx`; organ identities and sample readings → `src/systems.ts`. About dialog → `src/AboutAstroPulse.tsx`; decorative sky → `src/StarField.tsx`. The existing Body and AI Agent modes share the same glass inspector.

Selecting a body system switches to anatomy, opens Body, and retains camera position. Suit toggle retains the selected system. Sidebar mode retains conversation and selection. Reset view changes only camera and stops automatic rotation. Drag has explicit rotation and zoom button alternatives. A brief 240ms material fade communicates the model swap; reduced motion makes it immediate and disables auto-rotation. Global scrollbars have thumb, track, hover, active and forced-color treatments.

Loading states identify the requested model. A bounded fetch timeout becomes a persistent, recoverable error with Retry; the other loaded model stays usable. Never render invented geometry as fallback. Voice uses a cancellable timer with explicit demo language, no microphone access. Text responses are local canned sample summaries, not diagnostic advice.

## Do's and Don'ts

- Keep the imported model the dominant visual object.
- Preserve model framing and camera across sidebar/model changes.
- Label all sample readings and simulated assistant interaction.
- Do not call the anatomy a medically accurate fit beneath the astronaut suit.
- Do not add placeholder mesh geometry or claim missing assets loaded.
