# Signal Resolve Scroll Effects Design

Date: 2026-07-23
Status: Approved for implementation planning

## Summary

Add Kimi Careers–style scroll transition effects to the Netria homepage as a progressive-enhancement layer named **Signal Resolve**. Instead of only fading in, sections *resolve*: headings decode from pixel-glyph static, and visual blocks condense out of scattered pixels.

The effects are modeled on the careers.kimi.com/about-us scroll experience — character decode, pixel dissolve, re-triggered on every viewport entry — while keeping Netria's conventional scrolling, semantic HTML, accessibility, and static deployment model intact. The page structure, authored content, and navigation do not change.

## Goals

- Reproduce the two signature Kimi transition effects chosen by the stakeholder: **heading decode** and **pixel dissolve**.
- Re-run effects every time a tagged element enters the viewport (not once per page load).
- Remain a pure progressive enhancement: final content is complete in HTML and fully usable with JavaScript disabled, reduced motion enabled, or IntersectionObserver unavailable.
- Keep every existing contract test green, including the `script.js` size cap.
- Preserve the Quiet Signal visual system (palette, Fusion Pixel typography, scanlines, hard shadows).

## Non-Goals

- Full-screen scene navigation, scroll hijacking, or wheel-driven snapping (remains a rejected non-goal of the homepage refresh).
- Decoding body paragraphs, list items, or small labels (headings only).
- Number count-up animations (Netria presents no statistics).
- A CRT channel-change flash between sections.
- Canvas- or WebGL-rendered text/content (text must stay selectable, searchable, and accessible).
- Changes to authored copy, page structure, metadata, or the contact flow.

## Reference Analysis

Observed on careers.kimi.com/about-us via headless frame capture (2026-07-23):

- One wheel notch advances one full-screen scene; native document scroll is disabled.
- On scene entry, text resolves from random glyphs into final copy over a fraction of a second.
- On scene entry, dithered imagery condenses from scattered pixel noise.
- Statistics count up while supporting text decodes.
- Effects replay whenever a scene is re-entered.

Only the decode and dissolve transfer to a conventional page; Netria adopts those two, plus the re-trigger behavior.

## Architecture

A new deferred script, `effects.js`, owns both effects. `script.js` keeps its current responsibilities (mobile navigation, base reveals) unchanged.

### Files

- `effects.js` (new, ~130 lines): effect engine, loaded with `defer` after `script.js`.
- `index.html`: attribute-only additions — `data-decode` on the six display headings (hero `h1` and the `h2` of the capabilities, situations, approach, principles, and contact sections); `data-dissolve` on `.hero-signal`, both `.capability-card` elements, and `.contact`.
- `styles.css` (~30 lines): canvas overlay positioning, instant-show state for dissolve targets, reduced-motion guards.
- `tests/homepage-effects.test.mjs` (new): contract coverage for the enhancement layer.

### Heading Decode

- Trigger: a `data-decode` heading enters the viewport.
- The original text is captured once at init and stored in memory.
- During the effect, each non-whitespace character renders as a glyph from a block-heavy pool (`█▓▒░<>/\+=*#01`); characters resolve left-to-right with small random jitter over ~700ms using `requestAnimationFrame` and per-character timestamps. Whitespace renders immediately.
- Replay: on every entry the heading re-scrambles from scratch and resolves again.
- Accessibility: the heading carries a permanent `aria-label` with its final text; the scrambled text node is purely visual. With reduced motion or no JavaScript, the final text renders and no effect runs.

### Pixel Dissolve

- Trigger: a `data-dissolve` element enters the viewport.
- A temporary `<canvas>` is positioned exactly over the element (absolute, inset 0, `pointer-events: none`), sized to the element's box at device pixel ratio.
- The canvas is painted with scattered 8px blocks in signal-green tints over the dark surface, then cells are erased in random stepped bursts over ~500ms; the canvas node is then removed.
- The dissolve replaces the translateY fade for tagged elements: the element becomes visible instantly beneath the noise instead of sliding up.
- Re-entry recreates and replays the canvas each time.

### Trigger Lifecycle

- One IntersectionObserver inside `effects.js` watches every `[data-decode]` and `[data-dissolve]` target.
- Entry plays the effect; full exit (intersection ratio 0) re-arms: dissolve targets return to their hidden state so the dissolve replays, decode targets need no reset since re-scrambling starts from the stored original.
- `script.js` continues to unobserve its own reveal targets after first reveal; the instant-show behavior of dissolve targets is driven by `effects.js`, so the two observers do not conflict.

### Fallbacks

- `prefers-reduced-motion`: `effects.js` exits immediately; all content renders in final state.
- No IntersectionObserver support: same early exit.
- `no-js`: existing stylesheet rules keep all content visible; `effects.js` never loads a role.

## Error Handling

- Canvas 2D context unavailable or element box empty: skip the dissolve and show the element immediately.
- A heading with no text content: skipped at init.
- Every animation cleans up after itself (intervals cancelled, canvases removed) so re-entry never stacks state.

## Performance

- Constants: decode duration ~700ms, dissolve duration ~500ms, 8px cells.
- At most a few small canvases exist at once, each living under a second.
- Glyph rendering mutates text nodes only — no layout thrash; canvases are absolutely positioned overlays.

## Testing

### Contract tests (`tests/homepage-effects.test.mjs`)

- `effects.js` exists and references `IntersectionObserver` and `prefers-reduced-motion`.
- `effects.js` contains no banned patterns (`fetch(`, form, analytics, or localization behavior).
- `effects.js` stays under a 6 KB cap, matching the project's small-behavior convention.
- `index.html` carries `data-decode` on the hero `h1` and every section `h2`, and `data-dissolve` on the hero signal, capability cards, and contact panel.
- `styles.css` keeps reduced-motion guards for the new effect states.
- All 20 existing contract tests must remain green.

### Manual verification

- Headless captures mid-animation at several scroll depths on desktop and mobile widths (320px, 390px, 1440px).
- Re-entry replay: scroll away and back; effects replay.
- Keyboard-only navigation and skip link unaffected.
- Reduced-motion pass: no animation, all content visible.
