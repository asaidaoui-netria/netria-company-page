# Scene Pager + Glyph Wave Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Netria page as a no-scrollbar, five-scene experience with Kimi-parity pager and directional glyph-wave transitions, reusing the existing decode/dissolve entrance engine.

**Architecture:** `html.js`-gated shell (`overflow:hidden`, 100svh stage, absolutely stacked scenes) driven by a new zero-dependency `scenes.js` module: hand-rolled wheel/touch/key pager (Kimi's accumulate→threshold→lock→180ms-idle semantics), one master progress tweened over 800ms, `clip-path` wipe + full-viewport glyph-wave canvas sharing one wave-front function, hash sync via `pushState`/`popstate`, entrances (decode/dissolve) fired on scene entry. `effects.js` is deleted; its engine is ported into `scenes.js`.

**Tech Stack:** Static HTML/CSS/vanilla JS, Node built-in test runner (`node --test`), Playwright (tmp-dir scripts) for behavioral verification.

**Spec:** `docs/superpowers/specs/2026-07-24-scene-pager-glyph-wave-design.md` — read it first.

## Global Constraints

- Zero dependencies: no libraries, no build step, no `fetch(`, `FormData`, `analytics`, `i18n`, `contactForm`, `langDrawer` anywhere in JS.
- `scenes.js` < 18,500 bytes; `script.js` < 5,000 bytes.
- No `IntersectionObserver` anywhere after Task 2 (neither file may contain the string).
- Progressive enhancement: without the `html.js` class, the page MUST remain a normal scrolling document; all shell CSS is gated behind `html.js`.
- Do not change: authored copy (except the eyebrow numbers specified), meta tags, the Fusion Pixel subset font, pixel-identity CSS pins (`--color-bg:#050706`, `--color-signal:#63ff72`, `--font-display`, `--font-mono`, mobile h1 `clamp(2.8rem, 13vw, 4.6rem)`), `assets/`.
- All shell behavior keys off `document.documentElement.classList.contains("js")` (set by `script.js` line 1 — keep that line first in `script.js`).
- Work on branch `feat/scene-pager` created from `main`. Commit at the end of every task. Never push.
- Verification commands: `node --test tests/*.test.mjs`, `node --check scenes.js`, `node --check script.js`.

---

### Task 1: Five-scene structure + shell CSS

**Files:**
- Modify: `index.html` (script tag line 45; sections lines 79–266; footer lines 269–284)
- Modify: `styles.css` (remove lines 774–805 reveal rules; append shell block)
- Create: `scenes.js` (stub)
- Create: `tests/homepage-scenes.test.mjs`
- Delete: `tests/homepage-effects.test.mjs`
- Modify: `tests/homepage-style.test.mjs:38-41`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `.scene` elements in DOM order with ids `top, capabilities, situations, approach, contact`; `.scene--active` / `.scene--entering` / `.scroll-cue` / `#fx-wave` CSS classes; `html.js`-gated shell rules; `[data-dissolve]` hide-rule under `@media (prefers-reduced-motion: no-preference)`; `scenes.js` stub loaded with `defer`.

- [ ] **Step 1: Write the failing scene-structure tests**

Create `tests/homepage-scenes.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const scenes = readFileSync(new URL("../scenes.js", import.meta.url), "utf8");

test("main stage contains exactly five scenes with stable ids", () => {
  const ids = [
    ...html.matchAll(/<section class="[^"]*\bscene\b[^"]*" id="([^"]+)"/g),
  ].map((m) => m[1]);
  assert.deepEqual(ids, ["top", "capabilities", "situations", "approach", "contact"]);
});

test("footer content lives inside the contact scene exactly once", () => {
  assert.equal((html.match(/<footer class="footer">/g) || []).length, 1);
  const contact = html.slice(html.indexOf('id="contact"'));
  assert.match(contact, /<footer class="footer">/);
  assert.match(contact, /© 2026 Netria\. All rights reserved\./);
});

test("merged scene pairs situations and principles with renumbered eyebrows", () => {
  const merged = html.slice(html.indexOf('id="situations"'), html.indexOf('id="approach"'));
  assert.match(merged, /<span>03<\/span> Useful when/);
  assert.match(merged, /<span>04<\/span> Working principles/);
  assert.match(merged, /principle-grid/);
  assert.match(html.slice(html.indexOf('id="approach"')), /<span>05<\/span> How engagements work/);
  assert.match(html.slice(html.indexOf('id="contact"')), /<span>06<\/span> Open a channel/);
});

test("hero is the default active scene and carries a scroll cue", () => {
  const hero = html.slice(html.indexOf('id="top"'), html.indexOf('id="capabilities"'));
  assert.match(hero, /scene--active/);
  assert.match(hero, /class="scroll-cue"/);
});

test("loads scenes.js progressively and retires effects.js and data-reveal", () => {
  assert.match(html, /<script src="scenes\.js" defer><\/script>/);
  assert.doesNotMatch(html, /effects\.js/);
  assert.doesNotMatch(html, /data-reveal/);
});

test("shell locks native scroll only when js is on", () => {
  assert.match(css, /html\.js,\s*\r?\n?html\.js body\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /html\.js,\s*\r?\n?html\.js body\s*\{[^}]*touch-action:\s*none/s);
  assert.match(css, /html\.js main\s*\{[^}]*100svh/s);
  assert.match(css, /html\.js \.scene\s*\{[^}]*position:\s*absolute/s);
  assert.match(css, /html\.js \.scene--active\s*\{[^}]*visibility:\s*visible/s);
  assert.match(css, /html\.js \.scene--entering\s*\{[^}]*z-index:\s*2/s);
  assert.match(css, /#fx-wave\s*\{[^}]*position:\s*fixed/s);
  assert.match(css, /html\.js #fx-wave\.is-on\s*\{[^}]*display:\s*block/s);
});

test("dissolve blocks hide only when motion is allowed", () => {
  assert.match(
    css,
    /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{[^@]*html\.js \[data-dissolve\]\s*\{[^}]*opacity:\s*0/s
  );
  assert.doesNotMatch(css, /\[data-reveal\]/);
});

test("scenes.js stays lean and clean", () => {
  assert.ok(Buffer.byteLength(scenes, "utf8") < 18000);
  assert.doesNotMatch(scenes, /fetch\(|FormData|analytics|i18n|contactForm|langDrawer/);
});
```

Also delete the retired effects tests and fix the style test:

```bash
rm tests/homepage-effects.test.mjs
```

In `tests/homepage-style.test.mjs`, replace the test at lines 38–41 (`keeps reveal content visible without JavaScript`) with:

```js
test("keeps scenes in normal document flow without JavaScript", () => {
  assert.doesNotMatch(css, /\[data-reveal\]/);
  assert.match(css, /html\.js \.scene\s*\{/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/homepage-scenes.test.mjs`
Expected: FAIL — `scenes.js` missing (readFileSync throws) and/or structure assertions fail.

- [ ] **Step 3: Restructure index.html**

3a. Line 45, replace the effects script tag with:

```html
    <script src="scenes.js" defer></script>
```

(delete the `<script src="effects.js" defer></script>` line.)

3b. Remove every ` data-reveal` attribute in the file (exact string ` data-reveal` → empty; about 20 occurrences).

3c. Hero section (line 79): add scene classes, and add the scroll cue right before its closing `</section>` (after the `.hero-status` div):

```html
        <section class="hero scene scene--active" id="top">
```

```html
            <p class="scroll-cue" aria-hidden="true"><span>Scroll</span><span class="scroll-cue-arrow">↓</span></p>
```

3d. Capabilities (line 119): `<section class="section capabilities scene" id="capabilities">`

3e. Merge situations + principles into ONE section (replace the separate principles section wrapper):

```html
        <section class="section situations scene" id="situations">
            <div class="section-heading compact">
                <p class="eyebrow"><span>03</span> Useful when</p>
                <h2 data-decode>The next step needs more than another off-the-shelf tool.</h2>
            </div>

            <div class="situation-grid">
                ... (4 articles unchanged, minus data-reveal) ...
            </div>

            <div class="section-heading compact">
                <p class="eyebrow"><span>04</span> Working principles</p>
                <h2 data-decode>Dependable software starts with dependable decisions.</h2>
            </div>

            <div class="principle-grid">
                ... (4 articles unchanged, minus data-reveal) ...
            </div>
        </section>
```

(Keep the article inner markup byte-identical; only the wrappers merge and the principles eyebrow number changes `05` → `04`.)

3f. Approach (line 191): `<section class="section approach scene" id="approach">` and eyebrow `<span>04</span>` → `<span>05</span>`.

3g. Contact (line 255): `<section class="contact scene" id="contact" data-dissolve>`; move the entire `<footer class="footer">…</footer>` block (currently lines 269–284, after `</main>`) to inside this section, immediately after the `.contact-link` anchor and before `</section>`. The footer markup stays byte-identical.

- [ ] **Step 4: Update styles.css**

4a. Delete these rule blocks (currently lines 774–805): `[data-reveal]`, `[data-reveal].is-visible`, `[data-reveal][data-dissolve]`, `.no-js [data-reveal]`. Keep `[data-dissolve]` (position:relative) and `.dissolve-overlay`.

4b. Append at the end of the file:

```css
/* Scene shell (gated behind html.js: no-js keeps the normal scrolling document) */
html.js,
html.js body {
    height: 100%;
    overflow: hidden;
    overscroll-behavior: none;
    touch-action: none;
}

html.js main {
    position: relative;
    height: 100svh;
    overflow: hidden;
}

html.js .scene {
    position: absolute;
    inset: 0;
    visibility: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
}

html.js .scene--active {
    visibility: visible;
    z-index: 1;
}

html.js .scene--entering {
    visibility: visible;
    z-index: 2;
}

html.js .site-header {
    z-index: 70;
}

#fx-wave {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100svh;
    display: none;
    pointer-events: none;
    image-rendering: pixelated;
    z-index: 60;
}

html.js #fx-wave.is-on {
    display: block;
}

@media (prefers-reduced-motion: no-preference) {
    html.js [data-dissolve] {
        opacity: 0;
        transition: opacity 60ms steps(2, end);
    }

    html.js [data-dissolve].is-visible {
        opacity: 1;
    }
}

.scroll-cue {
    position: absolute;
    left: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-family: var(--font-mono);
    font-size: 1.1rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(149, 160, 151, 0.85);
}

.scroll-cue-arrow {
    color: var(--color-signal);
    animation: pixel-blink 1.1s steps(1) infinite;
}

/* Scene fit */
html.js .section.scene {
    padding-top: 84px;
    padding-bottom: 32px;
}

html.js .situations.scene {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 22px;
}

html.js .situations .section-heading,
html.js .situations .section-heading.compact {
    margin-bottom: 0;
}

html.js .contact.scene {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 28px;
}

html.js .contact.scene .footer {
    margin-top: 16px;
}

@media (max-width: 600px) {
    html.js .situation-grid,
    html.js .principle-grid {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    html.js .situation-grid article,
    html.js .principle-grid article {
        padding: 12px;
    }
}
```

- [ ] **Step 5: Create the scenes.js stub**

Create `scenes.js`:

```js
// Scene pager + directional glyph wave. See docs/superpowers/specs/2026-07-24-scene-pager-glyph-wave-design.md
const scenes = [...document.querySelectorAll(".scene")];

window.__scenes = { active: () => 0 };
```

- [ ] **Step 6: Run the full suite**

Run: `node --test tests/*.test.mjs && node --check scenes.js && node --check script.js`
Expected: all tests PASS (26 − 6 effects + 8 scenes = 28 tests).

- [ ] **Step 7: Commit**

```bash
git add index.html styles.css scenes.js tests/homepage-scenes.test.mjs tests/homepage-style.test.mjs tests/homepage-effects.test.mjs
git commit -m "feat: restructure page into five scenes"
```

---

### Task 2: Pager core — instant cuts, input, hash sync, nav

**Files:**
- Modify: `scenes.js` (full pager; replaces stub)
- Modify: `script.js` (delete lines 57–81 reveal block)
- Modify: `tests/homepage-behavior.test.mjs:15`
- Modify: `tests/homepage-scenes.test.mjs` (append pager tests)

**Interfaces:**
- Consumes: `.scene` structure and shell CSS from Task 1.
- Produces (used by Tasks 3–5): `scenes`, `REDUCED`, `active`, `busy`, `dir`, `target`, `p`, `goal`, `TRANS_MS`, `COMMIT`, `ENTRANCE_DELAY_MS`, `WHEEL_THRESHOLD`, `WHEEL_IDLE_MS`, `TOUCH_MIN`, `smooth(t)`, `clamp01(v)`, `settleTo(i)`, `enterScene(i, delayMs)`, `parkScene(i)` (stubs for now), `startTransition(next, direction)`, `goTo(i, direction)`, `syncHash(i)`, `syncNav(i)`, `hashIndex()`, `window.__scenes = { active, goTo }`.

- [ ] **Step 1: Write the failing pager tests**

Append to `tests/homepage-scenes.test.mjs`:

```js
test("pager implements kimi wheel semantics", () => {
  assert.match(scenes, /passive:\s*false/);
  assert.match(scenes, /preventDefault\(\)/);
  assert.match(scenes, /WHEEL_THRESHOLD\s*=\s*6/);
  assert.match(scenes, /WHEEL_IDLE_MS\s*=\s*180/);
  assert.match(scenes, /TOUCH_MIN\s*=\s*40/);
});

test("hash deep-linking, history, and nav are wired", () => {
  assert.match(scenes, /pushState/);
  assert.match(scenes, /popstate/);
  assert.match(scenes, /aria-current/);
  assert.match(scenes, /principles/);
});

test("exposes the scene test hook", () => {
  assert.match(scenes, /window\.__scenes/);
  assert.match(scenes, /goTo/);
});

test("no intersection observers remain", () => {
  assert.doesNotMatch(scenes, /IntersectionObserver/);
});
```

In `tests/homepage-behavior.test.mjs` line 15, change `assert.match(script, /IntersectionObserver/);` to `assert.doesNotMatch(script, /IntersectionObserver/);`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/homepage-scenes.test.mjs tests/homepage-behavior.test.mjs`
Expected: FAIL on the four new pager tests and the behavior test.

- [ ] **Step 3: Slim script.js**

Delete lines 57–81 (the `revealItems` / `reducedMotion` / IntersectionObserver block). Nothing else changes; line 1 (`classList.replace("no-js", "js")`) stays first. The file ends after the `desktopQuery` block's closing brace.

- [ ] **Step 4: Implement the pager in scenes.js**

Replace the whole stub with:

```js
// Scene pager + directional glyph wave. See docs/superpowers/specs/2026-07-24-scene-pager-glyph-wave-design.md
const JS = document.documentElement.classList.contains("js");
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scenes = [...document.querySelectorAll(".scene")];
const stage = document.getElementById("main");
const HASHES = ["", "capabilities", "situations", "approach", "contact"];
const ALIAS = { top: 0, capabilities: 1, situations: 2, principles: 2, approach: 3, contact: 4 };

const TRANS_MS = 800;
const COMMIT = 0.5;
const ENTRANCE_DELAY_MS = 250;
const WHEEL_THRESHOLD = 6;
const WHEEL_IDLE_MS = 180;
const TOUCH_MIN = 40;

let active = 0;
let busy = false;
let target = 0;
let dir = "forward";
let p = 0;
let goal = 1;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);

/* Entrances — wired in Task 5. */
function enterScene(i, delayMs) {}
function parkScene(i) {}

function hashIndex() {
    const h = location.hash.replace("#", "");
    return h ? ALIAS[h] ?? 0 : 0;
}

function syncNav(i) {
    document.querySelectorAll(".nav-menu a[href^='#'], .footer-links a[href^='#']").forEach((a) => {
        const idx = ALIAS[a.getAttribute("href").slice(1)];
        if (idx === i) {
            a.setAttribute("aria-current", "true");
        } else {
            a.removeAttribute("aria-current");
        }
    });
}

function syncHash(i) {
    history.pushState(null, "", HASHES[i] ? `#${HASHES[i]}` : location.pathname);
}

function settleTo(i) {
    scenes.forEach((s, k) => {
        const on = k === i;
        s.classList.toggle("scene--active", on);
        s.classList.remove("scene--entering");
        s.style.clipPath = "";
        if (on) {
            s.removeAttribute("aria-hidden");
            s.removeAttribute("inert");
        } else {
            s.setAttribute("aria-hidden", "true");
            s.setAttribute("inert", "");
            parkScene(k);
        }
    });
    active = i;
    syncNav(i);
}

function startTransition(next, direction) {
    if (busy || next === active || next < 0 || next >= scenes.length) {
        return;
    }
    settleTo(next); // Task 3 replaces this cut with the animated transition.
    syncHash(next);
    enterScene(next, 0);
}

function goTo(i, direction) {
    if (busy || i === active || i < 0 || i >= scenes.length) {
        return;
    }
    startTransition(i, direction || (i > active ? "forward" : "backward"));
}

/* Wheel pager (Kimi semantics: accumulate, threshold, lock, reverse, idle reset). */
let wheelAcc = 0;
let wheelIdle = 0;

function onWheel(e) {
    e.preventDefault();
    if (scenes.length < 2) {
        return;
    }
    clearTimeout(wheelIdle);
    wheelIdle = setTimeout(() => {
        wheelAcc = 0;
    }, WHEEL_IDLE_MS);
    if (busy) {
        const d = e.deltaY > 0 ? "forward" : e.deltaY < 0 ? "backward" : null;
        if (d && d !== dir) {
            goal = p >= COMMIT ? 1 : 0; // reversal: commit past halfway, else revert
        }
        return;
    }
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) >= WHEEL_THRESHOLD) {
        const d = wheelAcc > 0 ? "forward" : "backward";
        wheelAcc = 0;
        goTo(active + (d === "forward" ? 1 : -1), d);
    }
}

/* Touch: one vertical swipe past TOUCH_MIN = one scene step. */
let touchY = null;

function onTouchStart(e) {
    touchY = e.touches[0].clientY;
}

function onTouchEnd(e) {
    if (touchY == null) {
        return;
    }
    const dy = touchY - e.changedTouches[0].clientY;
    touchY = null;
    if (Math.abs(dy) > TOUCH_MIN) {
        goTo(active + (dy > 0 ? 1 : -1), dy > 0 ? "forward" : "backward");
    }
}

/* Keyboard pager. */
function onKeydown(e) {
    if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]")) {
        return;
    }
    const k = e.key;
    if (k === "ArrowDown" || k === "PageDown") {
        e.preventDefault();
        goTo(active + 1, "forward");
    } else if (k === "ArrowUp" || k === "PageUp") {
        e.preventDefault();
        goTo(active - 1, "backward");
    } else if (k === "Home") {
        e.preventDefault();
        goTo(0, "backward");
    } else if (k === "End") {
        e.preventDefault();
        goTo(scenes.length - 1, "forward");
    }
}

/* In-page anchors drive the pager instead of scrolling. */
function onDocClick(e) {
    const a = e.target instanceof Element ? e.target.closest("a[href^='#']") : null;
    if (!a) {
        return;
    }
    const idx = ALIAS[a.getAttribute("href").slice(1)];
    if (idx == null) {
        return;
    }
    e.preventDefault();
    goTo(idx, idx >= active ? "forward" : "backward");
}

function onPopState() {
    const i = hashIndex();
    if (i !== active) {
        goTo(i, i > active ? "forward" : "backward");
    }
}

if (JS && scenes.length > 1) {
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeydown);
    document.addEventListener("click", onDocClick);
    window.addEventListener("popstate", onPopState);
    settleTo(hashIndex());
    enterScene(active, 0);
}

window.__scenes = { active: () => active, goTo };
```

- [ ] **Step 5: Run the full suite**

Run: `node --test tests/*.test.mjs && node --check scenes.js && node --check script.js`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add scenes.js script.js tests/homepage-scenes.test.mjs tests/homepage-behavior.test.mjs
git commit -m "feat: add scene pager with hash sync"
```

---

### Task 3: Transition engine — progress tween + clip-path wipe

**Files:**
- Modify: `scenes.js` (replace `startTransition`; add tween/clip/reverse/resize)
- Modify: `tests/homepage-scenes.test.mjs` (append transition tests)

**Interfaces:**
- Consumes: `active`, `busy`, `target`, `dir`, `p`, `goal`, `TRANS_MS`, `COMMIT`, `ENTRANCE_DELAY_MS`, `smooth`, `clamp01`, `settleTo`, `syncHash`, `enterScene`, `parkScene` from Task 2.
- Produces: `frontY(x, q, s, H)`, `easeQ(q)`, `applyClip(el, q, s)`, `stepFrame(now)`, `requestReverse()`, `completeTransition()`, `onResize()`; `waveBegin()` / `wavePaint(eq)` / `waveEnd()` stubs (Task 4 fills them); `CLIP_STEPS = 24`.

- [ ] **Step 1: Write the failing transition tests**

Append to `tests/homepage-scenes.test.mjs`:

```js
test("transition tweens progress with clip-path wipe", () => {
  assert.match(scenes, /TRANS_MS\s*=\s*800/);
  assert.match(scenes, /COMMIT\s*=\s*0\.5/);
  assert.match(scenes, /CLIP_STEPS\s*=\s*24/);
  assert.match(scenes, /requestAnimationFrame/);
  assert.match(scenes, /clipPath\s*=\s*`polygon\(/);
  assert.match(scenes, /cancelAnimationFrame/);
});

test("wave front is perturbed by scene-phased sines", () => {
  assert.match(scenes, /function frontY\(/);
  assert.match(scenes, /0\.013/);
  assert.match(scenes, /0\.041/);
  assert.match(scenes, /0\.9\s*\*\s*s/);
  assert.match(scenes, /1\.7\s*\*\s*s/);
});

test("mid-transition resize snaps to the target scene", () => {
  assert.match(scenes, /addEventListener\("resize", onResize\)/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/homepage-scenes.test.mjs`
Expected: FAIL on the three new tests.

- [ ] **Step 3: Implement the transition engine**

3a. In `scenes.js`, after the `TOUCH_MIN` constant line, add:

```js
const CLIP_STEPS = 24;
```

3b. Replace the entire `startTransition` function with:

```js
/* Wave hooks — wired in Task 4. */
function waveBegin() {}
function wavePaint(eq) {}
function waveEnd() {}

const easeQ = (q) => smooth(clamp01(q));

/* Wave front y at column x: eased progress plus two scene-phased sines. */
function frontY(x, q, s, H) {
    return easeQ(q) * H + 38 * (0.6 * Math.sin(0.013 * x + 0.9 * s) + 0.4 * Math.sin(0.041 * x + 1.7 * s));
}

/* Clip the incoming scene along the wave front. Forward: reveal top-down. */
function applyClip(el, q, s) {
    const W = el.clientWidth;
    const H = el.clientHeight;
    const pts = [];
    for (let k = CLIP_STEPS; k >= 0; k--) {
        const x = (W * k) / CLIP_STEPS;
        pts.push(`${x.toFixed(1)}px ${frontY(x, q, s, H).toFixed(1)}px`);
    }
    const base = dir === "forward" ? `0px 0px, ${W}px 0px` : `0px ${H}px, ${W}px ${H}px`;
    el.style.clipPath = `polygon(${base}, ${pts.join(", ")})`;
}

let rafId = 0;
let lastT = 0;
let entranceTimer = 0;

function stepFrame(now) {
    const dt = Math.min(64, now - lastT);
    lastT = now;
    p = clamp01(p + ((goal === 1 ? dt : -dt) / TRANS_MS));
    const eq = dir === "forward" ? p : 1 - p;
    applyClip(scenes[target], eq, target);
    wavePaint(eq);
    if ((goal === 1 && p >= 1) || (goal === 0 && p <= 0)) {
        completeTransition();
        return;
    }
    rafId = requestAnimationFrame(stepFrame);
}

function requestReverse() {
    if (busy) {
        goal = p >= COMMIT ? 1 : 0;
    }
}

function completeTransition() {
    cancelAnimationFrame(rafId);
    clearTimeout(entranceTimer);
    waveEnd();
    settleTo(goal === 1 ? target : active);
    if (goal === 1) {
        syncHash(active);
    }
    busy = false;
}

function startTransition(next, direction) {
    if (busy || next === active || next < 0 || next >= scenes.length) {
        return;
    }
    if (REDUCED) {
        settleTo(next);
        syncHash(next);
        return;
    }
    busy = true;
    target = next;
    dir = direction;
    p = 0;
    goal = 1;
    const incoming = scenes[target];
    incoming.classList.add("scene--entering");
    incoming.removeAttribute("aria-hidden");
    incoming.removeAttribute("inert");
    entranceTimer = setTimeout(() => enterScene(target, 0), ENTRANCE_DELAY_MS);
    waveBegin();
    lastT = performance.now();
    rafId = requestAnimationFrame(stepFrame);
}

function onResize() {
    if (busy) {
        cancelAnimationFrame(rafId);
        clearTimeout(entranceTimer);
        waveEnd();
        settleTo(target);
        syncHash(active);
        busy = false;
    }
}
```

3c. In `onWheel`, replace the reversal lines:

```js
        if (d && d !== dir) {
            goal = p >= COMMIT ? 1 : 0; // reversal: commit past halfway, else revert
        }
```

with:

```js
        if (d && d !== dir) {
            requestReverse();
        }
```

3d. In the init block at the bottom, add the resize listener (before `settleTo(hashIndex());`):

```js
    window.addEventListener("resize", onResize);
```

- [ ] **Step 4: Run the full suite**

Run: `node --test tests/*.test.mjs && node --check scenes.js`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add scenes.js tests/homepage-scenes.test.mjs
git commit -m "feat: add scene transition engine"
```

---

### Task 4: Directional glyph-wave canvas

**Files:**
- Modify: `scenes.js` (replace the three wave stubs)
- Modify: `tests/homepage-scenes.test.mjs` (append wave tests)

**Interfaces:**
- Consumes: `dir`, `target`, `clamp01`, `easeQ`, `frontY` from Task 3; `#fx-wave` CSS from Task 1.
- Produces: `WAVE_CHARS`, `WAVE_BLOCKS`, `WAVE_COLORS`, `WAVE_GREEN`, `WCELL = 12`, `HEAD = 72`, `TAIL = 130`, `newWaveCell()`, `waveEnsure()`, `waveBegin()`, `wavePaint(eq)`, `waveEnd()` — replacing the stubs with the same signatures.

- [ ] **Step 1: Write the failing wave tests**

Append to `tests/homepage-scenes.test.mjs`:

```js
test("wave uses a 12px grid with head and tail falloff", () => {
  assert.match(scenes, /WCELL\s*=\s*12/);
  assert.match(scenes, /HEAD\s*=\s*72/);
  assert.match(scenes, /TAIL\s*=\s*130/);
  assert.match(scenes, /1\.7\)/);
});

test("wave palette is grayscale with rare green sparks", () => {
  assert.ok(scenes.includes("#63ff72"));
  assert.match(scenes, /1\s*\/\s*12/);
  assert.ok(scenes.includes("@#$%&*"));
  assert.match(scenes, /#ffffff/);
});

test("wave canvas lifecycle is gated and cleaned up", () => {
  assert.match(scenes, /"fx-wave"/);
  assert.match(scenes, /fillRect/);
  assert.match(scenes, /fillText/);
  assert.match(scenes, /document\.fonts/);
  assert.match(scenes, /clearRect/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/homepage-scenes.test.mjs`
Expected: FAIL on the three new tests.

- [ ] **Step 3: Implement the wave**

In `scenes.js`, replace the three stub functions (`waveBegin`, `wavePaint`, `waveEnd`) and their comment with:

```js
/* Directional glyph wave (port of the careers.kimi.com transition). */
const WAVE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";
const WAVE_BLOCKS = "█▓▒░";
const WAVE_COLORS = ["#ffffff", "#969696", "#505050"];
const WAVE_GREEN = "#63ff72";
const WCELL = 12;
const HEAD = 72;
const TAIL = 130;

let wave = null;
let waveOn = false;

function newWaveCell() {
    const char =
        Math.random() < 0.125
            ? WAVE_BLOCKS.charAt((Math.random() * WAVE_BLOCKS.length) | 0)
            : WAVE_CHARS.charAt((Math.random() * WAVE_CHARS.length) | 0);
    const color =
        Math.random() < 1 / 12 ? WAVE_GREEN : WAVE_COLORS[(Math.random() * WAVE_COLORS.length) | 0];
    return { char, color, threshold: Math.random(), edgeOffset: 2 * Math.random() - 1 };
}

function waveEnsure() {
    if (wave || REDUCED) {
        return wave;
    }
    const canvas = document.createElement("canvas");
    canvas.id = "fx-wave";
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) {
        return null;
    }
    document.body.appendChild(canvas);
    wave = { canvas, ctx, cells: new Map(), frame: 0 };
    return wave;
}

function waveBegin() {
    const w = waveEnsure();
    if (!w) {
        return;
    }
    const dpr = window.devicePixelRatio || 1;
    w.canvas.width = Math.round(window.innerWidth * dpr);
    w.canvas.height = Math.round(window.innerHeight * dpr);
    w.frame = 0;
    w.cells = new Map();
    const cols = Math.ceil(window.innerWidth / WCELL);
    const rows = Math.ceil(window.innerHeight / WCELL);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            w.cells.set(c + "," + r, newWaveCell());
        }
    }
    w.canvas.classList.add("is-on");
    waveOn = true;
}

function waveEnd() {
    if (wave) {
        wave.canvas.classList.remove("is-on");
        wave.ctx.clearRect(0, 0, wave.canvas.width, wave.canvas.height);
    }
    waveOn = false;
}

function wavePaint(eq) {
    if (!waveOn || !wave) {
        return;
    }
    const { ctx, canvas, cells } = wave;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const f = ++wave.frame;
    const E = clamp01(Math.min(eq / 0.3, (1 - eq) / 0.3));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (E <= 0) {
        return;
    }
    ctx.font = `${WCELL * dpr}px 'Fusion Pixel 12px Mono', monospace`;
    ctx.textBaseline = "top";
    const cols = Math.ceil(W / WCELL);
    const rows = Math.ceil(H / WCELL);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = cells.get(c + "," + r);
            if (!cell) {
                continue;
            }
            const px = (c + 0.5) * WCELL;
            const py = (r + 0.5) * WCELL;
            const d = py - frontY(px, eq, target, H);
            let a;
            if (Math.abs(d) <= HEAD) {
                a = E;
            } else {
                const wY = easeQ(eq) * H;
                const edgeDist = d < 0 ? wY : H - wY;
                const k = TAIL + Math.max(0, TAIL - edgeDist);
                const A =
                    Math.abs(d) -
                    (0.55 * cell.edgeOffset + 0.22 * Math.sin(0.07 * f + 7.3 * cell.edgeOffset)) * TAIL;
                if (A > k) {
                    continue;
                }
                a = 0.94 * Math.pow(1 - clamp01(A / k), 1.7) * E;
            }
            const N =
                0.5 + 0.5 * Math.sin(0.18 * f + 10.7 * cell.threshold + (0.31 * c + 0.17 * r));
            if (N > a) {
                continue;
            }
            if (N > 0.85 && (f + c + r) % 7 === 0) {
                const nc = newWaveCell();
                cell.char = nc.char;
                cell.color = nc.color;
            }
            ctx.fillStyle = "#000";
            ctx.fillRect(c * WCELL * dpr, r * WCELL * dpr, WCELL * dpr, WCELL * dpr);
            ctx.fillStyle = cell.color;
            ctx.fillText(cell.char, c * WCELL * dpr, r * WCELL * dpr);
        }
    }
}
```

Also add the font preload in the init block (before `settleTo(hashIndex());`):

```js
    if (document.fonts && document.fonts.load) {
        document.fonts.load("12px 'Fusion Pixel 12px Mono'");
    }
```

Note: this replaces the spec's "first transition waits on fonts.ready" with an upfront preload — the subset font is 4KB local, so it is ready long before the first gesture; painting falls back to monospace gracefully in the worst case.

- [ ] **Step 4: Run the full suite**

Run: `node --test tests/*.test.mjs && node --check scenes.js`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add scenes.js tests/homepage-scenes.test.mjs
git commit -m "feat: add directional glyph wave"
```

---

### Task 5: Port decode + dissolve entrances; delete effects.js

**Files:**
- Modify: `scenes.js` (replace `enterScene`/`parkScene` stubs; add entrance engine)
- Delete: `effects.js`
- Modify: `tests/homepage-scenes.test.mjs` (append entrance tests)

**Interfaces:**
- Consumes: `scenes`, `REDUCED`, `enterScene(i, delayMs)`, `parkScene(i)` call sites from Tasks 2–3.
- Produces: `GLYPHS`, `DECODE_MS = 700`, `DISSOLVE_MS = 500`, `TICK_MS = 50`, `CELL = 8`, `DCOLORS`, `textNodes(el)`, `initDecode(el)`, `runDecode(state)`, `runDissolve(el)`, `decodeStates` (Map), `prepEntrances()`.

- [ ] **Step 1: Write the failing entrance tests**

Append to `tests/homepage-scenes.test.mjs`:

```js
test("decode and dissolve engine is ported with original tuning", () => {
  assert.ok(scenes.includes("█▓▒░<>/\\+=*#01"));
  assert.match(scenes, /DECODE_MS\s*=\s*700/);
  assert.match(scenes, /DISSOLVE_MS\s*=\s*500/);
  assert.match(scenes, /createTreeWalker/);
  assert.match(scenes, /aria-label/);
  assert.match(scenes, /dissolve-overlay/);
});

test("entrances fire on scene entry and reset on park", () => {
  assert.match(scenes, /function enterScene\(i, delayMs\)/);
  assert.match(scenes, /function parkScene\(i\)/);
  assert.match(scenes, /ENTRANCE_DELAY_MS\s*=\s*250/);
});

test("effects.js is retired", () => {
  assert.throws(() => readFileSync(new URL("../effects.js", import.meta.url), "utf8"));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/homepage-scenes.test.mjs`
Expected: FAIL on the three new tests.

- [ ] **Step 3: Port the engine into scenes.js**

3a. Replace the two stub lines (`function enterScene…` / `function parkScene…` and their comment) with:

```js
/* Entrances: heading decode + pixel dissolve (ported from effects.js, fired per scene entry). */
const GLYPHS = "█▓▒░<>/\\+=*#01";
const DECODE_MS = 700;
const DISSOLVE_MS = 500;
const TICK_MS = 50;
const CELL = 8;
const DCOLORS = [
    "rgba(99,255,114,0.9)",
    "rgba(99,255,114,0.45)",
    "rgba(25,60,30,0.9)",
    "rgba(149,160,151,0.5)",
];

const decodeStates = new Map();

function textNodes(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
        nodes.push(node);
    }
    return nodes;
}

function initDecode(el) {
    const nodes = textNodes(el);
    const originals = nodes.map((node) => node.nodeValue);
    if (!originals.join("").trim()) {
        return null;
    }
    el.setAttribute("aria-label", originals.join(" ").replace(/\s+/g, " ").trim());
    return { nodes, originals, raf: 0 };
}

function runDecode(state) {
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

function runDissolve(el) {
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
    for (let q = 0; q < noise; q++) {
        ctx.fillStyle = DCOLORS[(Math.random() * DCOLORS.length) | 0];
        ctx.fillRect((cells[q] % cols) * size, ((cells[q] / cols) | 0) * size, size, size);
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

function prepEntrances() {
    document.querySelectorAll("[data-decode]").forEach((el) => {
        const state = initDecode(el);
        if (state) {
            decodeStates.set(el, state);
        }
    });
}

function enterScene(i, delayMs) {
    if (REDUCED) {
        return;
    }
    const scene = scenes[i];
    const run = () => {
        scene.querySelectorAll("[data-decode]").forEach((el) => {
            const state = decodeStates.get(el);
            if (state) {
                runDecode(state);
            }
        });
        scene.querySelectorAll("[data-dissolve]").forEach((el) => {
            el.classList.add("is-visible");
            runDissolve(el);
        });
    };
    if (delayMs) {
        setTimeout(run, delayMs);
    } else {
        run();
    }
}

function parkScene(i) {
    const scene = scenes[i];
    scene.querySelectorAll("[data-decode]").forEach((el) => {
        const state = decodeStates.get(el);
        if (!state) {
            return;
        }
        if (state.raf) {
            cancelAnimationFrame(state.raf);
            state.raf = 0;
        }
        state.nodes.forEach((node, k) => {
            node.nodeValue = state.originals[k];
        });
    });
    scene.querySelectorAll(".dissolve-overlay").forEach((c) => c.remove());
    scene.querySelectorAll("[data-dissolve]").forEach((el) => {
        el._fxBusy = false;
        el.classList.remove("is-visible");
    });
}
```

3b. In the init block at the bottom, add `prepEntrances();` as the first line inside the `if (JS && scenes.length > 1) {` block.

3c. Delete `effects.js`:

```bash
rm effects.js
```

- [ ] **Step 4: Run the full suite**

Run: `node --test tests/*.test.mjs && node --check scenes.js`
Expected: all PASS. Also verify the byte cap: `wc -c scenes.js` — expect < 18,000 (assembled plan code measures ~17.4KB). If over, the implementer reports it; do NOT strip comments to squeeze under without reviewer sign-off.

- [ ] **Step 5: Commit**

```bash
git add scenes.js effects.js tests/homepage-scenes.test.mjs
git commit -m "feat: port decode and dissolve entrances to scenes"
```

---

### Task 6: Docs, scene-fit verification, behavioral verification

**Files:**
- Modify: `README.md` (design bullets, tree entry, validation command)
- Modify: `styles.css` (only if fit verification demands adjustments)
- Verify-only: tmp-dir Playwright scripts (nothing added to the repo)

**Interfaces:**
- Consumes: everything above; `window.__scenes` hook for driving checks.
- Produces: updated README; final fit CSS values.

- [ ] **Step 1: Update README.md**

Replace the design bullet `- scroll effects that decode headings and dissolve pixels on every section entry;` with:

```markdown
- a no-scrollbar scene pager with a directional glyph-wave transition (careers.kimi.com parity), plus heading-decode and pixel-dissolve entrances on every scene entry;
```

Replace the bullet `- conventional scrolling and reduced-motion support.` with:

```markdown
- hash deep-linking, wheel/touch/keyboard navigation, and reduced-motion instant cuts (no-JS keeps the normal scrolling document).
```

In the file tree, replace `├── effects.js               # Signal Resolve scroll effects` with:

```markdown
├── scenes.js                # Scene pager, glyph wave, entrances
```

In Validation, replace `node --check effects.js` with:

```markdown
node --check scenes.js
```

- [ ] **Step 2: Run the full suite**

Run: `node --test tests/*.test.mjs`
Expected: all PASS (readme tests pin `Quiet Signal`, `hello@netria.dev`, `node --test tests/*.test.mjs` — all untouched).

- [ ] **Step 3: Scene-fit verification**

Start `python3 -m http.server 8123` from the repo root. Write `/var/folders/jl/7y_x237n2435vhkgql4mggdm0000gn/T/opencode/verify-scenes.mjs` (Playwright, chromium) that for each viewport 1440×900, 390×844, 320×568:
1. Loads `http://localhost:8123/`, waits for network idle.
2. For each scene index 0–4: calls `__scenes.goTo(i)`, waits 1200ms, then asserts `document.querySelector('.scene--active').scrollHeight <= document.querySelector('.scene--active').clientHeight + 2` (no internal overflow) and screenshots to `sc-{w}-{i}.png`.

Run: `cd /var/folders/jl/7y_x237n2435vhkgql4mggdm0000gn/T/opencode && node verify-scenes.mjs`
Expected: PASS for all 15 combinations. If a scene overflows at a viewport, adjust ONLY these CSS knobs in `styles.css` (then re-run): `html.js .section.scene` padding, `.situations.scene` gap, the 600px-grid compaction, hero-signal sizing in the 900px/600px media queries, `.contact.scene` gap. Do not change copy or font sizes below the pinned h1 clamp.

- [ ] **Step 4: Behavioral verification**

Write `/var/folders/jl/7y_x237n2435vhkgql4mggdm0000gn/T/opencode/verify-pager.mjs` (Playwright) asserting, at 1440×900:
1. **Wheel forward:** `page.mouse.wheel(0, 240)` → within 1200ms `__scenes.active()` becomes 1; mid-transition (sample ~300ms in) `#fx-wave.is-on` exists and `document.querySelector('.scene--entering')` is truthy; after completion `location.hash === "#capabilities"`.
2. **Direction mirror:** from scene 1, `page.mouse.wheel(0, -240)` → active becomes 0; during the transition capture the computed `clipPath` of the entering scene and assert the polygon base is the bottom edge (`0px 900px, 1440px 900px`).
3. **Lock:** two rapid `wheel(0, 240)` gestures 100ms apart → after 1200ms active is exactly 1 (no skip to 2).
4. **Keyboard:** `ArrowDown` → active 1; `End` → active 4; `Home` → active 0.
5. **Deep-link:** fresh page at `/#approach` → `__scenes.active()` is 3 immediately, no `#fx-wave.is-on`.
6. **popstate:** from a fresh page, wheel to scene 1, then `page.goBack()` → active returns to 0 with a wave (`#fx-wave.is-on` seen mid-transition).
7. **Entrances replay:** on entering scene 1, within 900ms at least one `[data-decode]` heading changes textContent between two samples 100ms apart; leave to scene 2 and back to 1 → headings decode again.
8. **Reduced motion:** new context with `reducedMotion: "reduce"` → wheel → active changes with NO `#fx-wave.is-on` ever appearing and no `.scene--entering` persisting beyond 50ms.
9. Screenshots: `pager-midwave-down.png` and `pager-midwave-up.png` captured ~300ms into transitions.

Run: `node verify-pager.mjs`
Expected: PASS on all checks. Then READ the two mid-wave screenshots: the wave band must cover the screen edge-to-edge with the glyph front mid-screen, denser near the front, sparse in the tail; direction of travel matches scroll direction.

- [ ] **Step 5: Final gate and commit**

Run: `node --test tests/*.test.mjs && node --check scenes.js && node --check script.js && wc -c scenes.js script.js`
Expected: all tests PASS; scenes.js < 18,000 bytes; script.js < 5,000 bytes.

```bash
git add README.md styles.css
git commit -m "docs: document scene pager and glyph wave"
```

---

## Self-Review Notes

- **Byte cap:** the assembled scenes.js from the task code below measures ~17.4KB, so the cap is 18,000 (spec updated to match). The cap exists to catch bloat, not to force minification.
- **Spec coverage:** shell/pager/touch/keys/anchors (T2), tween/clip/commit-revert/resize (T3), wave incl. palette/charset/font preload (T4), entrances + reset-on-park incl. revert suppression (T5), hash/deep-link/popstate (T2), fallbacks no-js/no-canvas/reduced-motion (T1/T3/T4), fit constraint (T1 initial values + T6 verification), contract tests (all tasks), behavioral verification (T6), README (T6). One deliberate spec deviation documented in T4: font preload at init instead of gating the first transition on `fonts.ready`.
- **Type consistency:** `enterScene(i, delayMs)` stubbed T2 → implemented T5 with same signature; `parkScene(i)` likewise; `waveBegin/wavePaint(eq)/waveEnd` stubbed T3 → implemented T4; `frontY(x, q, s, H)` defined T3, consumed T4; `easeQ` defined T3, consumed T4; `settleTo(i)` T2 → consumed T3; `__scenes` hook T2 → consumed T6.
- **Known accepted tradeoffs:** contract tests are static pins (string matches), not runtime assertions — runtime behavior is covered by the T6 Playwright scripts; `enterScene` setTimeout on the deep-link path is not tracked (runs once, idempotent); touch pager has no commit/revert (one swipe = one committed step, matching Kimi).

---

### Task 7: Seven-scene re-decomposition + mobile compaction (fit-verification driven)

Added after Task 6 verification proved the 5-scene merges cannot honestly fit 100svh (user decision: "7 scenes + aggressive mobile compaction"). Spec updated to match.

**Files:**
- Modify: `index.html` (split capabilities into two scenes; restore principles as its own scene)
- Modify: `scenes.js` (HASHES/ALIAS only)
- Modify: `styles.css` (compaction + single-card grid rules; the Task 1 `.situations.scene` merged-scene rules are repointed)
- Modify: `tests/homepage-scenes.test.mjs` (scene-id list, replace merged-scene test, add systems hash pin, add root-dissolve pin already present from the T6 fix)
- Modify: `tests/homepage-content.test.mjs` (section-id array gains `systems` and re-adds `principles`)
- Verify-only: tmp-dir Playwright scripts (updated)

**Interfaces:**
- Consumes: everything from Tasks 1–6.
- Produces: 7 scenes with ids `top, capabilities, systems, situations, principles, approach, contact`; `HASHES = ["", "capabilities", "systems", "situations", "principles", "approach", "contact"]`; `ALIAS = { top: 0, capabilities: 1, systems: 2, situations: 3, principles: 4, approach: 5, contact: 6 }`; fit = 21/21 measured combinations.

- [ ] **Step 1: Write the failing tests**

In `tests/homepage-scenes.test.mjs`:
1a. In the five-scene test, change the expected id list to:

```js
  assert.deepEqual(ids, ["top", "capabilities", "systems", "situations", "principles", "approach", "contact"]);
```

(and rename the test to `"main stage contains exactly seven scenes with stable ids"`.)

1b. Replace the test `merged scene pairs situations and principles with renumbered eyebrows` with:

```js
test("capabilities split into two single-card scenes", () => {
  const caps = html.slice(html.indexOf('id="capabilities"'), html.indexOf('id="systems"'));
  const systems = html.slice(html.indexOf('id="systems"'), html.indexOf('id="situations"'));
  assert.equal((caps.match(/capability-card/g) || []).length, 1);
  assert.equal((systems.match(/capability-card/g) || []).length, 1);
  assert.match(caps, /<span>02<\/span> Two ways we help/);
});

test("situations and principles are separate scenes", () => {
  const situ = html.slice(html.indexOf('id="situations"'), html.indexOf('id="principles"'));
  const prin = html.slice(html.indexOf('id="principles"'), html.indexOf('id="approach"'));
  assert.match(situ, /<span>03<\/span> Useful when/);
  assert.match(situ, /situation-grid/);
  assert.match(prin, /<span>04<\/span> Working principles/);
  assert.match(prin, /principle-grid/);
  assert.match(html.slice(html.indexOf('id="approach"')), /<span>05<\/span> How engagements work/);
});
```

1c. In the `hash deep-linking, history, and nav are wired` test, add:

```js
  assert.match(scenes, /systems/);
```

1d. In `tests/homepage-content.test.mjs`, change the section-id array to include the new and restored ids:

```js
["capabilities", "systems", "situations", "approach", "principles", "contact"]
```

Run: `node --test tests/homepage-scenes.test.mjs tests/homepage-content.test.mjs`
Expected: FAIL (ids list mismatch; `systems` missing; principles selector missing).

- [ ] **Step 2: Restructure index.html**

2a. Split the capabilities scene: keep `<section class="section capabilities scene" id="capabilities">` with the `.section-heading` and the FIRST `.capability-card` (card A, "Build a product") only, then close the section. Immediately after, add a second section containing card B byte-identical:

```html
        <section class="section capabilities systems scene" id="systems">
            <div class="capability-grid">
                <article class="capability-card" data-dissolve>
                    ... (card B "Improve a system" inner markup byte-identical) ...
                </article>
            </div>
        </section>
```

2b. Un-merge principles: inside the situations section, remove the second `.section-heading.compact` (Working principles) and the `.principle-grid` block; keep situations as `<section class="section situations scene" id="situations">` with its own heading + `.situation-grid`. Immediately after it, add:

```html
        <section class="section principles scene" id="principles">
            <div class="section-heading compact">
                <p class="eyebrow"><span>04</span> Working principles</p>
                <h2 data-decode>Dependable software starts with dependable decisions.</h2>
            </div>

            <div class="principle-grid">
                ... (4 articles byte-identical) ...
            </div>
        </section>
```

- [ ] **Step 3: Update scenes.js aliases**

Replace the HASHES and ALIAS lines with:

```js
const HASHES = ["", "capabilities", "systems", "situations", "principles", "approach", "contact"];
const ALIAS = { top: 0, capabilities: 1, systems: 2, situations: 3, principles: 4, approach: 5, contact: 6 };
```

- [ ] **Step 4: styles.css — single-card grids + repoint + compaction**

4a. Replace the Task-1 rule `html.js .situations.scene { ... }` selector list so both mini-grid scenes keep flex centering:

```css
html.js .situations.scene,
html.js .principles.scene,
html.js .systems.scene {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
}
```

(Remove the now-obsolete `html.js .situations .section-heading, html.js .situations .section-heading.compact { margin-bottom: 0; }` rule.)

4b. Single-card capability grids (all viewports):

```css
html.js .capabilities .capability-grid {
    grid-template-columns: minmax(0, 640px);
    justify-content: center;
}
```

4c. Contact-scene desktop compaction (fits 1440×900):

```css
html.js .contact.scene {
    padding-top: 80px;
    padding-bottom: 24px;
    gap: 0;
}
```

4d. Mobile compaction at ≤600px (append a new media block; values are starting points — see Step 6 authority):

```css
@media (max-width: 600px) {
    html.js .hero-signal,
    html.js .hero-status {
        display: none;
    }

    html.js .hero.scene {
        padding-top: 64px;
        padding-bottom: 40px;
        gap: 20px;
    }

    html.js .section.scene {
        padding-top: 60px;
        padding-bottom: 12px;
    }

    html.js .section-heading h2 {
        font-size: clamp(2.2rem, 9vw, 3rem);
    }

    html.js .section-heading > p:last-child {
        font-size: 1.3rem;
    }

    html.js .capability-card {
        padding: 14px;
    }

    html.js .capability-card p {
        font-size: 1.3rem;
    }

    html.js .capability-card li {
        font-size: 1.2rem;
    }

    html.js .approach-list {
        gap: 14px;
    }

    html.js .approach-list h3 {
        font-size: 1.4rem;
    }

    html.js .approach-list p {
        font-size: 1.2rem;
    }

    html.js .footer {
        padding-top: 16px;
        gap: 12px;
    }

    html.js .footer .brand img {
        width: 40px;
        height: 40px;
    }
}
```

- [ ] **Step 5: Run the full suite**

Run: `node --test tests/*.test.mjs && node --check scenes.js`
Expected: all PASS (44 tests: 43 + 1 renamed/replaced + content array).

- [ ] **Step 6: Fit verification loop (21/21 required)**

Serve the repo root on :8123. Update `/var/folders/jl/7y_x237n2435vhkgql4mggdm0000gn/T/opencode/verify-scenes.mjs` to iterate scene indices 0–6 (7 scenes) for the same three viewports (1440×900, 390×844, 320×568), same assert (`scrollHeight <= clientHeight + 2`), screenshots `sc-{w}-{i}.png`. Run it.

**Authority:** if a combination fails, adjust ONLY values/selectors inside the CSS rules added in Step 4 (never the pinned h1 clamp `clamp(2.8rem, 13vw, 4.6rem)`, never copy, never `--color-*` tokens, never the desktop-pinned tokens) and re-run. Legitimate additional moves if arithmetic demands them: 2-column `.capability-card ul` at ≤600px, smaller `.eyebrow` at ≤600px, `.approach-list > li > span` inline compaction, `.scroll-cue` bottom offset, `.contact-link` margin compaction, card `gap` reduction. Do not hide any content element other than `.hero-signal` / `.hero-status` (already mandated).

Expected: 21/21 PASS. If any scene still cannot fit after honest compaction, STOP and report DONE_WITH_CONCERNS with per-element measurements.

- [ ] **Step 7: Behavioral re-verification**

Update `/var/folders/jl/7y_x237n2435vhkgql4mggdm0000gn/T/opencode/verify-pager.mjs`:
- scene count 7: `End` key → active 6; deep-link `/#approach` → active 5; contact scene checks → index 6.
- Check 2 assert amendment (controller-approved): instead of the literal `1440px`, read the entering scene's `clientWidth` at runtime and assert the backward clip base equals `0px 900px, {clientWidth}px 900px` (scenes are width-capped columns; the wave canvas still covers edge-to-edge — confirmed visually in Task 6).
Run it. Expected: 9/9 PASS, including the contact scene now visibly rendering (root-dissolve fix from Task 6). Read the new mid-wave screenshots as before.

- [ ] **Step 8: Final gate + commit**

Run: `node --test tests/*.test.mjs && node --check scenes.js && wc -c scenes.js`
Expected: all PASS; scenes.js < 18,500 bytes.

```bash
git add index.html scenes.js styles.css tests/homepage-scenes.test.mjs tests/homepage-content.test.mjs
git commit -m "feat: split dense scenes for honest viewport fit"
```

Kill the dev server afterward.
