# Signal Resolve Scroll Effects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Kimi Careers–style heading decode and pixel dissolve scroll effects to the Netria homepage as a progressive-enhancement layer that replays on every viewport entry.

**Architecture:** A new deferred `effects.js` owns both effects behind an IntersectionObserver: headings tagged `data-decode` scramble from pixel glyphs and resolve left-to-right; blocks tagged `data-dissolve` appear instantly beneath a temporary canvas of erasing pixel noise. `script.js` is untouched.

**Tech Stack:** Static HTML/CSS/JS, no dependencies; Node built-in `node:test` contract tests.

**Spec:** `docs/superpowers/specs/2026-07-23-signal-resolve-scroll-effects-design.md`

## Global Constraints

- `script.js` stays unchanged; all 20 existing contract tests stay green (`node --test tests/*.test.mjs`).
- No changes to authored copy, metadata, section structure (attributes only), or the mailto contact flow.
- `effects.js` must contain no `fetch(`, `FormData`, analytics, or localization behavior; must stay under 6000 bytes (utf8).
- Glyph pool is exactly `█▓▒░<>/\+=*#01`; decode duration ~700ms; dissolve duration ~500ms; dissolve cell size 8px.
- Effects run only when JS is enabled (`html.js`), `prefers-reduced-motion` is off, and IntersectionObserver exists; otherwise content renders in final state.
- Decode must preserve heading child elements (`<em>`, `<br>`) — mutate text nodes only, never `textContent` of the heading.

---

### Task 1: HTML effect hooks + hook contract tests

**Files:**
- Create: `tests/homepage-effects.test.mjs`
- Modify: `index.html` (heading tags, `.hero-signal` div, two `.capability-card` articles, `.contact` section, script tags)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: hooks the engine relies on — `data-decode` on 1×`h1` + 5×`h2`; `data-dissolve` on `.hero-signal`, 2×`.capability-card`, `.contact`; `<script src="effects.js" defer></script>` immediately after the `script.js` tag.

- [ ] **Step 1: Write the failing test**

Create `tests/homepage-effects.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const effectsPath = join(root, "effects.js");

test("tags display headings for decode and visual blocks for dissolve", () => {
  assert.match(html, /<h1 data-decode>/);
  assert.equal((html.match(/<h2 data-decode>/g) ?? []).length, 5);
  assert.match(html, /<div class="hero-signal" aria-hidden="true" data-reveal data-dissolve>/);
  assert.equal(
    (html.match(/<article class="capability-card" data-reveal data-dissolve>/g) ?? []).length,
    2
  );
  assert.match(html, /<section class="contact" id="contact" data-dissolve>/);
});

test("loads the effects module progressively", () => {
  assert.match(html, /<script src="script\.js" defer><\/script>\s*<script src="effects\.js" defer><\/script>/);
  assert.equal(existsSync(effectsPath), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/homepage-effects.test.mjs`
Expected: FAIL — both tests fail (no `data-decode` attributes, no `effects.js` script tag, no file).

- [ ] **Step 3: Add the hooks to index.html**

Apply these exact edits:

1. Line 81, hero heading:
`<h1>Software for ideas and operations <em>in motion.</em></h1>`
→
`<h1 data-decode>Software for ideas and operations <em>in motion.</em></h1>`

2. Line 121, capabilities heading:
`<h2>Build something new.<br>Improve what already moves.</h2>`
→
`<h2 data-decode>Build something new.<br>Improve what already moves.</h2>`

3. Line 163, situations heading:
`<h2>The next step needs more than another off-the-shelf tool.</h2>`
→
`<h2 data-decode>The next step needs more than another off-the-shelf tool.</h2>`

4. Line 193, approach heading:
`<h2>Clarity first. Then forward motion.</h2>`
→
`<h2 data-decode>Clarity first. Then forward motion.</h2>`

5. Line 231, principles heading:
`<h2>Dependable software starts with dependable decisions.</h2>`
→
`<h2 data-decode>Dependable software starts with dependable decisions.</h2>`

6. Line 257, contact heading:
`<h2>Have an idea or operation that needs forward motion?</h2>`
→
`<h2 data-decode>Have an idea or operation that needs forward motion?</h2>`

7. Line 97, hero signal:
`<div class="hero-signal" aria-hidden="true" data-reveal>`
→
`<div class="hero-signal" aria-hidden="true" data-reveal data-dissolve>`

8. Lines 128 and 143, capability cards (two identical edits):
`<article class="capability-card" data-reveal>`
→
`<article class="capability-card" data-reveal data-dissolve>`

9. Line 254, contact section:
`<section class="contact" id="contact">`
→
`<section class="contact" id="contact" data-dissolve>`

10. Line 44, script tags:
`<script src="script.js" defer></script>`
→
`<script src="script.js" defer></script>\n    <script src="effects.js" defer></script>`
(as two properly indented lines)

- [ ] **Step 4: Run test to verify partial pass**

Run: `node --test tests/homepage-effects.test.mjs`
Expected: first test PASSES; second test still FAILS only because `effects.js` does not exist yet (that assertion lands in Task 2 — create an empty placeholder now to make the whole task green: run `printf '// Signal Resolve effects engine. Implemented in Task 2.\n' > effects.js`, then re-run: both tests PASS).

Also run the full suite to confirm no regressions:
Run: `node --test tests/*.test.mjs`
Expected: 22 tests, all pass (20 existing + 2 new).

- [ ] **Step 5: Commit**

```bash
git add index.html effects.js tests/homepage-effects.test.mjs
git commit -m "feat: add signal resolve effect hooks"
```

---

### Task 2: The effects engine (`effects.js`)

**Files:**
- Modify: `effects.js` (replace placeholder)
- Test: `tests/homepage-effects.test.mjs` (append engine tests)

**Interfaces:**
- Consumes: hooks from Task 1 (`data-decode`, `data-dissolve`, `html.js` class set by `script.js`).
- Produces: `.dissolve-overlay` canvas class (styled in Task 3); `is-visible` class toggling on dissolve targets (shared with the existing reveal CSS); top-level `fx*`-prefixed functions and constants, matching the flat style of `script.js` (no name collisions with it).

- [ ] **Step 1: Append the failing engine tests**

Add to `tests/homepage-effects.test.mjs` (after the existing tests; add `const css = readFileSync(join(root, "styles.css"), "utf8");` and `const effects = readFileSync(effectsPath, "utf8");` at the top of the file):

```js
test("effects engine observes entries and respects motion preferences", () => {
  assert.match(effects, /IntersectionObserver/);
  assert.match(effects, /prefers-reduced-motion/);
  assert.match(effects, /requestAnimationFrame/);
  assert.match(effects, /aria-label/);
  assert.match(effects, /createElement\("canvas"\)/);
  assert.match(effects, /getContext\("2d"\)/);
});

test("effects engine avoids retired or banned behavior", () => {
  assert.doesNotMatch(
    effects,
    /FormData|fetch\(|contactForm|i18n|langDrawer|analytics/i
  );
});

test("keeps the effects file intentionally small", () => {
  assert.ok(Buffer.byteLength(effects, "utf8") < 6000);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/homepage-effects.test.mjs`
Expected: FAIL — the three new tests fail against the placeholder file.

- [ ] **Step 3: Implement effects.js**

Replace the whole file with:

```js
// Signal Resolve: heading decode and pixel dissolve scroll effects.
const FX_ENABLED =
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    "IntersectionObserver" in window &&
    document.documentElement.classList.contains("js");

const GLYPHS = "█▓▒░<>/\\+=*#01";
const DECODE_MS = 700;
const DISSOLVE_MS = 500;
const TICK_MS = 50;
const CELL = 8;
const COLORS = ["rgba(99,255,114,0.9)", "rgba(99,255,114,0.45)", "rgba(25,60,30,0.9)", "rgba(149,160,151,0.5)"];

function fxTextNodes(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
        nodes.push(node);
    }
    return nodes;
}

function fxInitDecode(el) {
    const nodes = fxTextNodes(el);
    const originals = nodes.map((node) => node.nodeValue);
    if (!originals.join("").trim()) {
        return null;
    }
    el.setAttribute("aria-label", originals.join(" ").replace(/\s+/g, " ").trim());
    return { nodes, originals, raf: 0 };
}

function fxScramble(state) {
    const originals = state.originals;
    const total = originals.join("").length;
    const offsets = [];
    let acc = 0;
    originals.forEach((text) => {
        offsets.push(acc);
        acc += text.length;
    });
    const resolveAt = [];
    for (let i = 0; i < total; i++) {
        const base = total > 1 ? i / (total - 1) : 0;
        resolveAt.push(base * DECODE_MS * 0.6 + Math.random() * DECODE_MS * 0.4);
    }
    if (state.raf) {
        cancelAnimationFrame(state.raf);
    }
    const start = performance.now();

    function frame(now) {
        const t = now - start;
        let settled = true;
        for (let n = 0; n < state.nodes.length; n++) {
            let out = "";
            for (let c = 0; c < originals[n].length; c++) {
                const ch = originals[n].charAt(c);
                if (/\s/.test(ch) || t >= resolveAt[offsets[n] + c]) {
                    out += ch;
                } else {
                    settled = false;
                    out += GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
                }
            }
            state.nodes[n].nodeValue = out;
        }
        if (!settled && t < DECODE_MS + 120) {
            state.raf = requestAnimationFrame(frame);
        } else {
            for (let r = 0; r < state.nodes.length; r++) {
                state.nodes[r].nodeValue = originals[r];
            }
            state.raf = 0;
        }
    }
    state.raf = requestAnimationFrame(frame);
}

function fxDissolve(el) {
    if (el._fxBusy) {
        return;
    }
    const rect = el.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    const ctx = rect.width > 1 && rect.height > 1 && canvas.getContext("2d");
    if (!ctx) {
        return;
    }
    const dpr = window.devicePixelRatio || 1;
    const size = CELL * dpr;
    const cols = Math.ceil(rect.width / CELL);
    const rows = Math.ceil(rect.height / CELL);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.className = "dissolve-overlay";
    canvas.setAttribute("aria-hidden", "true");

    const cells = [];
    for (let i = 0; i < cols * rows; i++) {
        cells.push(i);
    }
    for (let j = cells.length - 1; j > 0; j--) {
        const k = (Math.random() * (j + 1)) | 0;
        const swap = cells[j];
        cells[j] = cells[k];
        cells[k] = swap;
    }
    ctx.fillStyle = "#050706";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const noise = Math.round(cells.length * 0.55);
    for (let p = 0; p < noise; p++) {
        ctx.fillStyle = COLORS[(Math.random() * COLORS.length) | 0];
        ctx.fillRect((cells[p] % cols) * size, ((cells[p] / cols) | 0) * size, size, size);
    }
    el.appendChild(canvas);
    el._fxBusy = true;

    const perTick = Math.max(1, Math.round(cells.length / (DISSOLVE_MS / TICK_MS)));
    let cursor = 0;
    const timer = setInterval(() => {
        const end = Math.min(cells.length, cursor + perTick);
        for (; cursor < end; cursor++) {
            ctx.clearRect((cells[cursor] % cols) * size, ((cells[cursor] / cols) | 0) * size, size, size);
        }
        if (cursor >= cells.length) {
            clearInterval(timer);
            canvas.remove();
            el._fxBusy = false;
        }
    }, TICK_MS);
}

if (FX_ENABLED) {
    const decodeStates = new Map();
    document.querySelectorAll("[data-decode]").forEach((el) => {
        const state = fxInitDecode(el);
        if (state) {
            decodeStates.set(el, state);
        }
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const el = entry.target;
                if (entry.intersectionRatio >= 0.2 && !el._fxOn) {
                    el._fxOn = true;
                    if (decodeStates.has(el)) {
                        fxScramble(decodeStates.get(el));
                    }
                    if (el.hasAttribute("data-dissolve")) {
                        el.classList.add("is-visible");
                        fxDissolve(el);
                    }
                } else if (entry.intersectionRatio === 0) {
                    el._fxOn = false;
                    if (el.hasAttribute("data-dissolve")) {
                        el.classList.remove("is-visible");
                    }
                }
            });
        },
        { threshold: [0, 0.2] }
    );

    document.querySelectorAll("[data-decode], [data-dissolve]").forEach((el) => observer.observe(el));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/homepage-effects.test.mjs`
Expected: all 5 tests PASS.

Run: `node --test tests/*.test.mjs && node --check effects.js`
Expected: 25 tests, all pass; no syntax error.

- [ ] **Step 5: Commit**

```bash
git add effects.js tests/homepage-effects.test.mjs
git commit -m "feat: add signal resolve effects engine"
```

---

### Task 3: Dissolve styles + reduced-motion guard + visual verification

**Files:**
- Modify: `styles.css` (after the `[data-reveal].is-visible` rule, and inside the `prefers-reduced-motion` block)
- Test: `tests/homepage-effects.test.mjs` (append style test)

**Interfaces:**
- Consumes: `.dissolve-overlay` canvas class and `is-visible` toggling from Task 2; existing `[data-reveal]` rules in `styles.css`.
- Produces: nothing consumed by later code.

- [ ] **Step 1: Append the failing style test**

Add to `tests/homepage-effects.test.mjs`:

```js
test("guards effect states under reduced motion", () => {
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.dissolve-overlay/);
  assert.match(css, /\[data-reveal\]\[data-dissolve\]/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/homepage-effects.test.mjs`
Expected: FAIL — the style test fails (no such CSS yet).

- [ ] **Step 3: Add the CSS**

In `styles.css`, immediately after the `[data-reveal].is-visible { ... }` rule, add:

```css
[data-dissolve] {
    position: relative;
}

[data-reveal][data-dissolve] {
    transform: none;
    transition: opacity 60ms steps(2, end);
}

.dissolve-overlay {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    image-rendering: pixelated;
}
```

Inside the `@media (prefers-reduced-motion: reduce)` block, after the `[data-reveal]` rule there, add:

```css
    .dissolve-overlay {
        display: none !important;
    }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/*.test.mjs`
Expected: 26 tests, all pass.

- [ ] **Step 5: Verify the visuals manually**

Run: `python3 -m http.server 8123` from the project root, open `http://localhost:8123/`, and confirm:

1. On load, the hero `h1` decodes from pixel glyphs and the moth panel dissolves in through pixel noise.
2. Scrolling down, each section `h2` decodes; capability cards and the contact panel dissolve.
3. Scrolling back up and down again replays the effects (re-arm on exit).
4. Text remains selectable after the decode finishes; the `<em>` green span and blinking cursor in the `h1` are intact; the `<br>` in the capabilities `h2` still breaks the line.
5. Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce": reload; all content is visible with no animation.
6. Check 320px, 390px, and 1440px widths for overflow or overlay misalignment.

Stop the server afterwards (`lsof -ti :8123 | xargs kill`).

- [ ] **Step 6: Commit**

```bash
git add styles.css tests/homepage-effects.test.mjs
git commit -m "feat: style signal resolve dissolve states"
```

---

### Task 4: README documentation + final validation

**Files:**
- Modify: `README.md` (Design section bullet list)

**Interfaces:**
- Consumes: finished feature from Tasks 1–3.
- Produces: none.

- [ ] **Step 1: Document the behavior**

In `README.md`, in the Design section bullet list, after the line `- CRT scanlines, dithered textures, pixel-cut corners, and hard offset shadows;` add:

```markdown
- scroll effects that decode headings and dissolve pixels on every section entry;
```

- [ ] **Step 2: Run the full validation suite**

Run: `node --test tests/*.test.mjs && node --check script.js && node --check effects.js && git diff --check`
Expected: 26 tests, all pass; no syntax errors; no whitespace errors.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document signal resolve scroll effects"
```

---

## Self-Review Notes

- **Spec coverage:** heading decode (Task 2, `fxScramble`), pixel dissolve (Task 2, `fxDissolve`), re-run on entry (Task 2, observer re-arm via `_fxOn`), progressive enhancement fallbacks (Task 2 `FX_ENABLED` guard + Task 3 CSS), contract tests (Tasks 1–3), manual verification (Task 3 step 5), README (Task 4). HTML hooks incl. all six headings and four dissolve targets (Task 1).
- **Structure preservation:** decode mutates text nodes only via `fxTextNodes` — `<em>`/`<br>` and the `h1 em::after` cursor are untouched; `aria-label` carries the final text.
- **Observer interplay:** `script.js` unobserves reveal targets after first reveal; `effects.js` owns `is-visible` toggling for dissolve targets afterwards. `[data-reveal][data-dissolve]` transition override (60ms steps) replaces the 650ms slide so the element snaps in beneath the noise.
- **Size check:** the `effects.js` source above measures 5626 bytes (utf8) — under the 6000-byte contract cap — and passes `node --check`.
