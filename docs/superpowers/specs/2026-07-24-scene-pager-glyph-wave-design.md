# Scene Pager + Directional Glyph Wave — Design

Date: 2026-07-24
Status: Approved (pending final user review)
Supersedes: `2026-07-23-signal-resolve-scroll-effects-design.md` (the scroll-entry effects are absorbed into this system; decode/dissolve internals survive as scene-entry effects)

## Context

The Netria company page is a zero-dependency static site (`index.html`, `styles.css`, `script.js`, `effects.js`) with a pixel identity (Fusion Pixel subset font, scanlines, hard shadows) and scroll-entry effects (heading decode, pixel dissolve) driven by IntersectionObserver on a normal scrolling document.

The reference experience, careers.kimi.com, works fundamentally differently:

1. **No native scroll.** `html,body { overflow:hidden; height:100%; touch-action:none; overscroll-behavior:none }`. The site is one fixed 100svh stage; "pages" are scenes in an array, swapped by a hand-rolled pager: a `wheel` listener (`{passive:false}` + `preventDefault`) accumulates `deltaY`, fires one scene change past a threshold, locks during the transition, unlocks on opposite direction, resets after 180ms idle. On completion, `history.pushState` updates the URL. All visuals derive from a single tweened progress value.
2. **Directional full-screen glyph wave.** A canvas overlay of 12px character cells. A horizontal wavefront (`frontY = ease(progress) × H`) sweeps vertically — top→bottom when scrolling down, bottom→top when scrolling up (progress inverted). The front is perturbed by two sine waves phased by the target scene index; cells within 72px of the front render fully, a 130px tail falls off as `0.94×(1−t)^1.7` with per-cell jitter and temporal wobble; bright cells re-roll their glyph for flicker; a global envelope fades the wave in/out over the first/last 30% of the transition. The incoming scene is simultaneously revealed by a `clip-path` polygon whose edge follows the same wave function, so the glyph band rides exactly on the wipe boundary.

Goal: full parity with these two components, keeping the site's zero-dependency character and existing pixel identity.

## Decisions (user-approved)

| Question | Decision |
|---|---|
| Scene decomposition | **5 scenes**: hero / capabilities / situations+principles (merged) / approach / contact+footer (footer folds into contact scene) |
| URL behavior | **Hash sync + deep-linking**: `pushState` on transition complete, recognized hash loads directly into its scene, `popstate` drives the pager |
| Reduced motion | **Instant cuts**: pager still navigates; no wave, no decode, no dissolve |
| Entrance effects | **Keep decode + dissolve**, rewired from IntersectionObserver to scene-entry, replaying on every entry |
| Wave palette | **Grayscale + rare green sparks**: `#fff` / `#969696` / `#505050`, ~1/12 cells re-rolled to signal green `#63ff72` |
| Implementation | **Faithful hand-rolled port**, zero dependencies (no GSAP, no scroll-snap) |

## Architecture

### Shell

- `html.js` gates everything (progressive enhancement, unchanged pattern). Without JS the page remains the current normal-scrolling document — hard requirement.
- With JS: `html,body { overflow:hidden; height:100%; overscroll-behavior:none; touch-action:none }`.
- `<main>` becomes a fixed stage: `height:100svh; position:relative; overflow:hidden`.
- Scenes stack: `position:absolute; inset:0`. Inactive scenes: `visibility:hidden; aria-hidden:true; inert`. Active scene (and its neighbor during a transition) are live.
- `site-header` stays fixed above the stage; scenes pad for header height.
- Defensive: a scene whose content exceeds the viewport may scroll internally (`overflow-y:auto`), but the design goal is that this never happens (see Fit constraint).

### Scenes

Existing content re-parented into 5 scenes:

1. **hero** (`#top`) — moth art + heading + tagline + new scroll cue ("Scroll" + blinking pixel arrow; static `↓` under reduced motion). Eyebrow `01`.
2. **capabilities** (`#capabilities`) — 3 cards, unchanged. Eyebrow `02`.
3. **situations-principles** (`#situations`, alias `#principles`) — "Useful when" grid (eyebrow `03`) + "Working principles" grid (eyebrow renumbered `05→04`). On mobile both mini-grids go 2-column with compact spacing.
4. **approach** (`#approach`) — 4-step list, unchanged. Eyebrow renumbered `04→05`.
5. **contact** (`#contact`) — contact block (eyebrow `06`, unchanged) + footer content folded in; the standalone `<footer>` element is removed.

Eyebrow renumbering: principles `05→04`, approach `04→05`; all others unchanged.

### Scene manager (`scenes.js`)

New module absorbing `effects.js` (which is deleted). Owns: scene array, active index, pager state machine, all input sources, the transition driver, the wave canvas, and the entrance effects (decode/dissolve ported unchanged in behavior).

**State machine:** `idle → animating → idle`, with `reverting` as a sub-state of `animating`. No queue: input during `animating` is ignored except a direction reversal (see below).

**Wheel pager (Kimi's recipe):**
- `addEventListener("wheel", handler, {passive:false})` on the stage; always `preventDefault()`.
- Accumulate raw `deltaY`; when `|accumulated| ≥ 6`, fire `goTo(index ± 1, direction)`, reset accumulator, lock. (A single mouse-notch reports ~100 and fires immediately; trackpad micro-deltas accumulate over a few ticks — this is the reference's exact threshold.)
- While locked: a wheel gesture of the **opposite** sign unlocks and triggers reversal handling; same-sign input is ignored.
- 180ms of wheel silence resets accumulator and direction memory.
- At the first/last scene, input in the out-of-range direction is swallowed (page does not move).

**Touch:** `touchstart`/`touchend` vertical delta; |Δ| > 40px = one scene step. Same lock semantics.

**Keyboard:** ArrowDown/PageDown → next; ArrowUp/PageUp → prev; Home → first; End → last. Ignored when focus is in a form field (there are none today; guard anyway).

**Anchors:** nav links, logo, and any `a[href^="#"]` call `goTo(index)` instead of scrolling; the mobile nav menu closes on select (existing behavior preserved).

### Fit constraint (hard acceptance criterion)

Every scene must fit within 100svh at 320×568 and at 1440×900 without internal scrolling. Mobile compaction is part of the work: smaller hero moth canvas, 2-col mini-grids on the merged scene, tighter section padding/gaps, clamp-based type already in place. Verified by screenshots in the plan's verification step.

## Transition engine

- A transition tweens one number `p` from 0→1 over **800ms** via rAF with smoothstep easing (`p²(3−2p)`).
- Direction `forward` (down) / `backward` (up). Wave-front progress `q = p` forward, `q = 1−p` backward, so the sweep mirrors.
- **Commit/revert:** on reversal, if current `p ≥ 0.5` the tween completes to the neighbor; otherwise it tweens back to 0 (revert). A revert does not re-run entrance effects and does not change the hash.
- **Clip-path wipe:** the incoming scene renders on top, revealed by `clip-path: polygon(...)` whose cutting edge samples the wave-front function at ~24 x-positions (same sine perturbation as the canvas). Forward: polygon grows downward from the top edge; backward: upward from the bottom edge. At `p = 1` the clip is removed and the old scene parks (`visibility:hidden`).
- On completion: `history.pushState` to the scene's hash (hero → bare path, no hash); active nav link updates; `sceneenter` bookkeeping finalizes.
- **Resize mid-transition:** cancel directly to the target scene (no animation), rebuild wave grid.

## Wave engine

Full-viewport `<canvas>` above the stage (`z-index` below header), `image-rendering:pixelated`, painted only during transitions (rAF loop starts at transition start, stops at end).

**Grid:** 12px cells × devicePixelRatio. Cell state persists in a `Map<"x,y", cell>` rebuilt when dimensions change:
- `char`: random from `A–Za–z0–9@#$%&*`; ~1/8 of cells instead roll from the block set `█▓▒░`.
- `color`: random from `[#ffffff, #969696, #505050]`; then ~1/12 of cells re-roll to `#63ff72`.
- `threshold ∈ [0,1)`, `edgeOffset ∈ [−1,1)`.

**Per frame** (progress `q`, frame counter `f`, target scene index `s`):
- Front: `w = ease(q) × H`, perturbed per column x: `w' = w + 38×(0.6·sin(0.013x + 0.9s) + 0.4·sin(0.041x + 1.7s))`.
- Envelope: `E = clamp(min(q/0.3, (1−q)/0.3), 0, 1)`; if `E ≤ 0`, skip frame.
- Per cell with center `(cx, cy)`, signed distance `d = cy − w'`:
  - Head zone `|d| ≤ 72`: alpha `a = E`.
  - Tail zone: `A = |d| − (0.55·edgeOffset + 0.22·sin(0.07f + 7.3·edgeOffset))×130`; tail length `k = 130 + max(0, 130 − edgeDist)` where `edgeDist` is the front's distance to the screen edge on the cell's side (so the falloff stretches to a full gradient when the front is near an edge, exactly as the reference); skip if `A > k`; else `a = 0.94 × (1 − clamp(A/k))^{1.7} × E`.
- Twinkle: `N = 0.5 + 0.5·sin(0.18f + 10.7·threshold + (0.31col + 0.17row))`; draw only if `N ≤ a`. If `N > 0.85` and `(f + col + row) mod 7 = 0`, re-roll char + color.
- Draw: black `fillRect` over the cell, then `fillText(char)` in cell color. Font `12px × dpr 'Fusion Pixel 12px Mono'` — the subset already covers U+0020–00FF (includes `@#$%&*`) and U+2580–259F (`█▓▒░`); first transition waits on `document.fonts.ready`.

**Reduced motion:** canvas never starts; pager cuts instantly.
**No canvas 2d / font failure:** wave skipped; transition becomes clip-path wipe only.

## Entrance effects (rewired)

- Decode (700ms, text-node-safe TreeWalker walk, permanent `aria-label`, charset `█▓▒░<>/\+=*#01`) and dissolve (500ms, 8px-cell canvas overlay, random-order erase) keep their exact current internals.
- The IntersectionObserver and its `_fxOn/_fxBusy` machinery are deleted.
- The scene manager dispatches entrances when a scene activates: on transition start + ~250ms (content materializes as the wave tail passes), and on direct-load deep-link (immediately, once).
- Every entry replays entrances (leaving and returning re-runs decode/dissolve), matching the approved "re-run on every entry" behavior — now triggered by scene entry instead of viewport re-entry.
- `data-decode` / `data-dissolve` attributes stay as the hook mechanism and keep their current assignments (6 headings incl. both merged-scene h2s; hero-signal, capability cards, contact block). The old `data-reveal` per-item observer reveals are gone: in the scene model, any scene content without a `data-decode`/`data-dissolve` hook is simply visible whenever its scene is active. Entrance engine state resets when a scene parks, so interrupted entrances always restart cleanly on the next entry.

## URL / hash

| Scene | Hash | Alias |
|---|---|---|
| hero | (bare path) | `#top` resolves here |
| capabilities | `#capabilities` | |
| situations-principles | `#situations` | `#principles` resolves here |
| approach | `#approach` | |
| contact | `#contact` | |

- Transition complete → `pushState` (not `replaceState`, so back/forward walks scene history).
- Load with recognized hash/alias → open directly on that scene, no wave, entrances run once.
- Unknown hash → hero.
- `popstate` → `goTo` with full wave transition.
- Active nav link = active scene (replaces scroll-spy in `script.js`).

## Fallbacks & error handling

| Condition | Behavior |
|---|---|
| No JS / script error | Normal scrolling document (shell CSS gated behind `html.js`) |
| `prefers-reduced-motion` | Instant cuts; static scroll cue; no wave/decode/dissolve |
| No canvas 2d / font load failure | Clip-path wipe only |
| Mid-transition resize | Snap to target scene; rebuild grid |
| Input spam | Lock + reverse-unlock + 180ms idle reset; no queue |
| Out-of-range input (first/last scene) | Swallowed, nothing moves |

## Testing

**Contract tests** — `tests/homepage-effects.test.mjs` is replaced by `tests/homepage-scenes.test.mjs` pinning:
- Shell: `overflow:hidden` rules exist and are gated behind `html.js`; stage has `100svh`; scenes absolutely stacked.
- Structure: exactly 5 scenes with correct ids; footer content present exactly once (inside contact scene); eyebrow sequence `01,02,03,04,05,06` in order; scroll cue present in hero.
- Engine: `scenes.js` exists, ≤ **18,000 bytes** (twice-adjusted from the ~9KB estimate; the plan's assembled code measures ~17.4KB at project style), contains pinned constants (12, 72, 130, sine frequencies 0.013/0.041, phases 0.9/1.7, charset incl. `@#$%&*`, `#63ff72`, 800ms, wheel threshold 6, 180ms idle reset, 0.5 commit), no banned patterns (`fetch(`, `FormData`, `analytics`, `i18n`, `contactForm`, `langDrawer`).
- `effects.js` absent from HTML; `scenes.js` loaded with `defer`.
- Guards: reduced-motion and no-canvas fallbacks present; `document.fonts.ready` gate present.
- Existing pixel-identity/content contract tests (~20) untouched; `script.js` cap stays but its pinned content changes (scroll-spy gone, `goTo` hook present).

**Behavioral verification** (Playwright, mirroring the previous fx-verify):
- Wheel down: wave canvas paints, front sweeps top→bottom, scene 2 activates, hash updates after completion.
- Wheel up: front sweeps bottom→top.
- Wheel during lock: no scene skip; opposite wheel mid-flight: commit if `p≥0.5` else revert.
- Keyboard arrows navigate; nav link click `goTo`s.
- Deep-link `#approach` opens scene 4 directly; `popstate` triggers transition.
- Entrances replay on re-entry; suppressed on revert.
- Reduced-motion emulation: instant cuts, no canvas.
- Screenshots: all 5 scenes at 1440×900, 390×844, 320×568 (fit check — no internal scrollbars); mid-wave frames both directions.

## Out of scope

- Kimi's ambient glyph-wall background, seeded-RNG ASCII-art image renderer, procedural moon, GSAP tooling.
- Any change to copy, contact address, or brand tokens beyond what scene merging requires.
- Multi-page routing; this remains a single-page site.

## Acceptance criteria

1. No scrollbar; all five scenes navigate via wheel/touch/keys/nav/hash.
2. Every transition shows the directional glyph wave with scene-index-phased silhouette, mirrored by scroll direction, riding the clip-path wipe edge.
3. Decode + dissolve replay on every scene entry (except reverts).
4. Hash deep-linking and back/forward work.
5. Reduced motion: fully navigable with instant cuts.
6. No JS: page is the normal scrolling document.
7. All scenes fit 100svh at 320×568 and 1440×900.
8. All contract tests pass; behavioral verification passes.
