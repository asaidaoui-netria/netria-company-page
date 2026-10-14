# Customer-Facing Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage answer a buyer's first questions (what do you build, how does a project run, who will I work with, how do I reach you) on a page that scrolls like any other.

**Architecture:** Static homepage (`index.html`, `styles.css`, `script.js`, `signal.js`) copied through by Eleventy. Remove the scene pager (`scenes.js`) so content is no longer capped at one screen per section; restore the process section the pager squeezed out; add a founder block, a hero summary line, a copy-address button and a pre-filled email brief. The WebGPU layers stay.

**Tech Stack:** Plain HTML, CSS and JavaScript; Eleventy 3.1.6 for the build; Node's built-in test runner (`node --test`) with regex contract tests that read the source files.

**Spec:** `docs/superpowers/specs/2026-07-23-netria-homepage-refresh-design.md` (the original approved design: conventional scrolling, a process section, direct email) plus the **Decisions** below, made on 2026-10-14 after a customer-perspective review of the live site.

## Decisions (2026-10-14)

- **Scrolling:** normal document scroll. Delete the scene pager and glyph wave. This retires `docs/superpowers/specs/2026-07-24-scene-pager-glyph-wave-design.md`, whose one-screen-per-scene fit is what removed the hero summary (`cb7c93e`) and the process section (`2f79e8e`).
- **Proof:** none yet. No case studies, logos or testimonials. Credibility comes from a concrete process section and a named founder.
- **Founder:** name, short bio and LinkedIn link on the homepage. Article bylines link to it.
- **Contact:** email only, plus a "Copy address" button. Every homepage email link opens with a short brief (what, when, budget).
- **Kept:** the Quiet Signal look, the four WebGPU layers, the principles section (made readable), geography-neutral copy.
- **Out of scope:** the "Useful when" situations section (the capability cards cover it), legal imprint and address (the geography-neutral decision stands), changes to the article, and the meta description and `llms.txt` summary (search snippets, pinned by tests; revisit separately).

## Owner inputs (fill in before Task 3)

Tasks 3 and 4 copy these values verbatim. Replace each `«KEY»` in those tasks with the value here. **If a required value is blank, stop and ask the owner. Never invent it.** Defaults are proposals; the owner confirms or edits them.

Avoid these phrases anywhere in the copy, because the `avoids unsupported proof claims` test bans them: "trusted by", "client logo", "testimonial", "100%", "projects delivered", "years of experience". Say "since 2019", not "7 years of experience".

| Key | Required | Value (default in italics where one is proposed) |
|---|---|---|
| `«FOUNDER_NAME»` | yes | *Abderrahman SaidAlaoui* (spelling used in the article byline; git uses "Said-Alaoui": confirm which) |
| `«FOUNDER_ROLE»` | yes | *Founder, Netria* |
| `«FOUNDER_BIO»` | yes | Blank. Two or three plain sentences: what you have built, for what kind of team, and with what. Only facts you are happy to publish, and no client names without their consent. |
| `«LINKEDIN_URL»` | yes | Blank. Must start with `https://www.linkedin.com/in/`. |
| `«REPLY_LINE»` | yes | *You'll hear back from Abderrahman directly, usually within two working days.* |
| `«HERO_SUMMARY»` | yes | *We build web apps, internal tools and automations for teams whose work has outgrown spreadsheets and off-the-shelf software.* |
| `«PROCESS_HEADING»` | yes | *You see working software early, and you know the price before each step.* |
| `«STEP_1»` | yes | *A call, then a short written brief: the outcome, who will use it, what is out of scope, and a fixed price for the next step.* |
| `«STEP_2»` | yes | *A clickable prototype or a working spike on your real data, so you can judge the direction before paying for the full build.* |
| `«STEP_3»` | yes | *Working software every one to two weeks, tested against how your team actually works.* |
| `«STEP_4»` | yes | *Deployed, documented and yours: the code, the accounts and the know-how to run it.* |

The defaults for `«PROCESS_HEADING»` and `«STEP_1»`–`«STEP_4»` make commitments: a fixed price per step, a prototype before the build, delivery every one to two weeks, and full handover. `«REPLY_LINE»` promises a reply time. Change any of these you won't honour.

## Global Constraints

- No `<form>`, form service, booking widget or analytics (tests: `uses direct email contact with no contact form`, `ships no analytics or custom localization`).
- No unsupported proof claims (test: `avoids unsupported proof claims`).
- No location: Morocco, Moroccan, Maroc, المغرب, Kenitra or Kénitra must not appear (test: `uses internationally neutral English metadata`).
- English only. All copy in semantic text nodes, never in canvas, images or CSS `content`, except the decorative "Copied" tooltip.
- No new dependencies and no new external requests. The shaders bundle URL and its import-map integrity hash stay unchanged.
- WebGPU layers keep their gate (WebGPU, a fine pointer, motion allowed) and fall back to the static page.
- `script.js` stays under 5000 bytes (test: `keeps the behavior file intentionally small`).
- Everything readable and every link working without JavaScript.
- Commit messages end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01VD5ManwFwMf8hH1aJdZoBe
  ```

## Review Focus

1. **Old deep links.** `/#capabilities`, `/#principles`, `/#contact` and `/#approach` (shared before the pager) must land on their section with its heading below the fixed header. *Pinned in Task 1 (scroll-margin) and Task 3 (section ids).*
2. **A 320px phone.** The restored process list and the founder block must not cause horizontal scrolling. *Pinned in Task 3 (the 42px step column below 600px). Checked by hand in Final checks.*
3. **Clipboard refused** (permissions policy, older browser). The copy button must fail quietly while the address stays visible and selectable. *Pinned in Task 5 (the `catch` branch).*
4. **No JavaScript.** Every section is visible, every email link works, and the copy button is hidden instead of doing nothing. *Pinned in Task 5 (`.no-js .copy-email`).*
5. **Mail apps reading the pre-filled brief.** Line breaks must be `%0D%0A` and spaces `%20`, never `+`, or some clients show literal plus signs. *Pinned in Task 5.*

---

### Task 0: Branch from a clean tree

The working tree holds finished, uncommitted work: copyable `#` links on article section headings (README.md, eleventy.config.js, script.js, styles.css, tests/articles.test.mjs). All 60 tests pass with it. Keep it out of this branch's diffs.

- [ ] **Step 1: Confirm the tests pass on the current tree**

Run: `npm test`
Expected: `ℹ fail 0`

- [ ] **Step 2: Commit the heading-link work on `main` (ask the owner first; if they say no, `git stash` it instead)**

```bash
git add README.md eleventy.config.js script.js styles.css tests/articles.test.mjs
git commit -m "feat: give article sections a link that copies their address

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VD5ManwFwMf8hH1aJdZoBe"
```

- [ ] **Step 3: Branch**

```bash
git switch -c feat/customer-fixes
```

---

### Task 1: Let the homepage scroll normally

Removes the scene pager, glyph wave and scroll cues. Moves the footer out of the contact section. Keeps the capabilities and principles WebGPU layers edge to edge in normal flow.

**Files:**
- Delete: `scenes.js`, `tests/homepage-scenes.test.mjs`
- Modify: `index.html`, `_includes/base.njk:5`, `styles.css`, `signal.js`, `eleventy.config.js:8,12`, `README.md`, `docs/superpowers/specs/2026-07-24-scene-pager-glyph-wave-design.md:4`
- Test: `tests/homepage-style.test.mjs`, `tests/homepage-signal.test.mjs`, `tests/homepage-content.test.mjs`, `tests/articles.test.mjs`

**Interfaces:**
- Produces: sections keep `class="... scene"` (used by the `.scene > .scene-fx` layer CSS). `<footer class="footer">` becomes a direct child of `<body>` after `</main>`. No `scene--active`, `paged` or `scroll-cue` anywhere.

- [ ] **Step 1: Write the failing tests**

In `tests/homepage-style.test.mjs`, replace the whole `test("keeps scenes in normal document flow without JavaScript", ...)` block with:

```js
test("the homepage scrolls like a normal document", () => {
  assert.doesNotMatch(css, /html\.paged|#fx-wave|scroll-cue|pixel-blink|scene--active|scene--entering/);
  assert.doesNotMatch(css, /\[data-reveal\]/);
  // Layers sit behind their section's content and above the page background.
  assert.match(css, /\.scene\s*\{[^}]*position:\s*relative;[^}]*isolation:\s*isolate;/s);
  // Capabilities and principles layers break out of the content column to the viewport edges.
  // !important: signal.js sizes every layer canvas with an inline width of 100%.
  assert.match(
    css,
    /\.capabilities > \.scene-fx,\s*\.principles > \.scene-fx\s*\{[^}]*left:\s*calc\(50% - 50vw\);[^}]*width:\s*100vw !important;/s
  );
  assert.match(css, /main\s*\{[^}]*overflow-x:\s*clip;/s);
  // Deep links land below the fixed header.
  assert.match(css, /\.section\s*\{[^}]*scroll-margin-top:\s*var\(--header-height\)/s);
});
```

In `tests/homepage-signal.test.mjs`, replace the whole `test("only the scene on screen draws", ...)` block with:

```js
test("layers leave off-screen pausing to the renderer", () => {
  assert.doesNotMatch(signal, /scene--active|scene--entering|MutationObserver|closest\("\.scene"\)/);
});
```

In `tests/homepage-content.test.mjs`, add at the end:

```js
test("the page is one scrolling document with a page footer", () => {
  assert.doesNotMatch(html, /scenes\.js|scroll-cue|scene--active/);
  assert.match(html, /<\/main>\s*<footer class="footer">/);
  assert.match(html, /© 2026 Netria\. All rights reserved\./);
});
```

In `tests/articles.test.mjs`, replace the whole `test("only the homepage pager locks native scroll", ...)` block with:

```js
test("no page locks native scroll", () => {
  assert.equal(existsSync(join(root, "scenes.js")), false);
  assert.ok(!STATIC.includes("scenes.js") && !VERSIONED.includes("scenes.js"));
  assert.doesNotMatch(read("styles.css"), /html\.js\b|html\.paged/);
  const live = (html) => html.replace(/<!--[\s\S]*?-->/g, "").replace(/\{#[\s\S]*?#\}/g, "");
  assert.match(live(read("index.html")), /<a href="\/articles\/">Articles<\/a>/);
  assert.match(live(read("_includes/base.njk")), /<a href="\/articles\/"/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL in `the homepage scrolls like a normal document`, `layers leave off-screen pausing to the renderer`, `the page is one scrolling document with a page footer` and `no page locks native scroll`.

- [ ] **Step 3: Delete the pager and its tests**

```bash
git rm scenes.js tests/homepage-scenes.test.mjs
```

- [ ] **Step 4: Edit `index.html`**

1. Delete the line `    <script src="scenes.js" defer></script>`.
2. Change the line-5 comment to `<!-- Before first paint: JS-dependent layout (fixed header) must not flash its no-JS form -->`. Make the same change in `_includes/base.njk:5`.
3. Change `<section class="hero scene scene--active" id="top">` to `<section class="hero scene" id="top">`.
4. Delete all three lines `            <p class="scroll-cue" aria-hidden="true"><span class="scroll-cue-chevrons"><i></i><i></i><i></i></span></p>` together with the blank line before each.
5. Move the footer out of the contact section. The end of the file must read:

```html
            <a class="contact-link"
                href="mailto:hello@netria.dev?subject=Project%20conversation">
                <span class="contact-scope" aria-hidden="true"></span>
                <span>hello@netria.dev</span>
                <span aria-hidden="true">↗</span>
            </a>
        </section>
    </main>

    <footer class="footer">
        <a class="brand" href="#top" aria-label="Netria home">
            <picture>
                <source srcset="assets/netria-logo-footer-transparent.webp" type="image/webp">
                <img src="assets/netria-logo-footer-transparent.png" alt="" width="60" height="60">
            </picture>
            <span>Netria</span>
        </a>
        <p>© 2026 Netria. All rights reserved.</p>
    </footer>
</body>
</html>
```

- [ ] **Step 5: Delete the pager CSS**

The pager block runs from the comment `/* Scene shell (gated behind html.paged ...` to just before `/* Articles: ordinary scrolling pages ...`. It contains only `html.paged`, `#fx-wave` and `.scroll-cue` rules (checked 2026-10-14). Cut it in one step:

```bash
node -e 'const fs=require("fs");let c=fs.readFileSync("styles.css","utf8");const a=c.indexOf("/* Scene shell");const b=c.indexOf("/* Articles: ordinary scrolling pages");if(a<0||b<a)throw new Error("anchors not found");fs.writeFileSync("styles.css",c.slice(0,a)+c.slice(b))'
```

Then in `styles.css`:

1. Change the comment `/* Articles: ordinary scrolling pages built by Eleventy (no scene pager) */` to `/* Articles: pages built by Eleventy */`.
2. Delete the whole `@keyframes pixel-blink { ... }` block. It was only used by the scroll cue.
3. Replace this block:

```css
/* Behind the scene's content, above its backdrop (active scenes are stacking contexts) */
.scene > .scene-fx {
    z-index: -1;
    transition: opacity 300ms;
}

/* Full-bleed layers outlast a wipe into a column-wide scene at the sides: fade them as it starts */
main:has(.scene--entering) .scene--active > .scene-fx {
    opacity: 0;
}
```

with:

```css
/* Behind the section's content, above the page background: each scene is its own stacking context */
.scene {
    position: relative;
    isolation: isolate;
}

.scene > .scene-fx {
    z-index: -1;
}

/* Full bleed: these layers break out of the content column to the viewport edges.
   !important beats the inline width: 100% that signal.js puts on every layer canvas. */
.capabilities > .scene-fx,
.principles > .scene-fx {
    left: calc(50% - 50vw);
    width: 100vw !important;
}

/* 100vw counts a desktop scrollbar: clip that sliver instead of scrolling sideways */
main {
    overflow-x: clip;
}
```

- [ ] **Step 6: Edit `signal.js`**

Replace the capabilities layer's `wire`:

```js
        // Grid has no speed prop: scroll it one cell per loop (wrap makes the seam invisible).
        wire(shader, host) {
            const roll = (t) => {
                if (host.matches(".scene--active, .scene--entering")) {
                    shader.update("floor", { transform: { offsetY: (t / 4000) % (1 / 12), edges: "wrap" } });
                }
                requestAnimationFrame(roll);
            };
            requestAnimationFrame(roll);
        },
```

with:

```js
        // Grid has no speed prop: scroll it one cell per loop (wrap makes the seam invisible).
        // ponytail: updates every frame even while scrolled away; gate on an IntersectionObserver if it shows in a profile.
        wire(shader) {
            const roll = (t) => {
                shader.update("floor", { transform: { offsetY: (t / 4000) % (1 / 12), edges: "wrap" } });
                requestAnimationFrame(roll);
            };
            requestAnimationFrame(roll);
        },
```

In `mountLayer`, delete the line `    const scene = host.closest(".scene");`. Replace the closing block:

```js
    wire?.(shader, host, canvas);

    // Stacked scenes all look visible to the renderer: only draw while the owning one is on
    // screen. Outside the pager the renderer already pauses layers scrolled out of view.
    if (scene) {
        const sync = () => (scene.matches(".scene--active, .scene--entering") ? shader.resume() : shader.pause());
        new MutationObserver(sync).observe(scene, { attributes: true, attributeFilter: ["class"] });
        sync();
    }
}
```

with:

```js
    // The renderer pauses layers scrolled out of view.
    wire?.(shader, host, canvas);
}
```

- [ ] **Step 7: Edit `eleventy.config.js`**

```js
export const STATIC = ["index.html", "styles.css", "script.js", "signal.js", "explorer.js", "assets", "CNAME", "robots.txt"];
```

```js
export const VERSIONED = ["styles.css", "script.js", "signal.js", "explorer.js"];
```

- [ ] **Step 8: Update the docs**

In `README.md`, under **Design**:
- Delete the bullet that starts `- a no-scrollbar scene pager with a directional glyph-wave transition`.
- In the WebGPU bullet, change `one green-phosphor reference per scene` to `one green-phosphor reference per section`.
- Replace the last bullet (`- hash deep-linking, wheel/touch/keyboard navigation, and reduced-motion instant cuts (no-JS keeps the normal scrolling document).`) with `- an ordinary scrolling page, so section links, the keyboard and reduced motion behave as browsers expect.`

Under **Project Structure**, delete the line `├── scenes.js                # Scene pager, glyph wave, entrances`. Under **Validation**, delete the line `node --check scenes.js`.

In `docs/superpowers/specs/2026-07-24-scene-pager-glyph-wave-design.md`, change line 4 to:

```markdown
Status: Retired 2026-10-14. The homepage scrolls normally again (docs/superpowers/plans/2026-10-14-customer-facing-fixes.md).
```

- [ ] **Step 9: Run the tests and syntax checks**

Run: `npm test && node --check signal.js && node --check script.js && git diff --check`
Expected: `ℹ fail 0`, no output from the checks.

- [ ] **Step 10: Check it in a browser**

Run `npm start` and open `http://localhost:8080/` at 1440×900 in Chrome (WebGPU on, mouse):
- The page scrolls with the wheel, trackpad and Page Down. Nothing snaps.
- The capabilities grid floor and the principles number field fill the full window width. No horizontal scrollbar: in the console, `document.documentElement.scrollWidth === innerWidth` is `true`.
- `http://localhost:8080/#principles` loads with the principles eyebrow visible below the header.
- The footer sits below the contact box, not inside it.
- Scrolling a section under the header leaves the header on top. Its base rule has `z-index: 1000`, and the deleted pager rule had lowered it to 70.
- At 390×844 the hero's **Start a conversation** button is on screen without scrolling. The pager CSS hid the moth on phones, and now it shows below the button. If the button falls below the fold, add `.hero-signal { display: none; }` to the existing `@media (max-width: 600px)` block.

- [ ] **Step 11: Commit**

```bash
git add -A index.html _includes/base.njk styles.css signal.js eleventy.config.js README.md docs/superpowers/specs/2026-07-24-scene-pager-glyph-wave-design.md tests/
git commit -m "feat: let the homepage scroll normally

The scene pager capped every section at one screen, which pushed the
hero summary and the process section off the page. Sections now scroll
as one document; the WebGPU layers stay, edge to edge.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VD5ManwFwMf8hH1aJdZoBe"
```

---

### Task 2: Keep the principles text readable over its number field

On the live site the drifting digits run at full strength behind the principles heading, and the "03 Working principles" label nearly disappears. Dim the field outside the cursor lens and give the heading a dark halo.

**Files:**
- Modify: `styles.css` (the `.principles > .scene-fx` rule and the rule after it)
- Test: `tests/homepage-style.test.mjs`

- [ ] **Step 1: Write the failing test**

Add to `tests/homepage-style.test.mjs`:

```js
test("the principles number field stays behind readable text", () => {
  assert.match(css, /\.principles > \.scene-fx\s*\{[^}]*mask-image:[^}]*rgb\(0 0 0 \/ 0\.1\)\)/s);
  assert.match(css, /\.principles:has\(> \.scene-fx\) \.section-heading\s*\{[^}]*text-shadow:/s);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/homepage-style.test.mjs`
Expected: FAIL in `the principles number field stays behind readable text`.

- [ ] **Step 3: Implement**

In `styles.css`, change:

```css
.principles > .scene-fx {
    mask-image: radial-gradient(circle 15rem at var(--mx, 70%) var(--my, 40%), black, rgb(0 0 0 / 0.28));
}
```

to:

```css
/* Full strength only under the cursor lens: elsewhere the digits stay faint behind the text */
.principles > .scene-fx {
    mask-image: radial-gradient(circle 15rem at var(--mx, 70%) var(--my, 40%), black, rgb(0 0 0 / 0.1));
}

.principles:has(> .scene-fx) .section-heading {
    text-shadow: 0 0 0.3em var(--color-bg), 0 0 0.8em var(--color-bg);
}
```

- [ ] **Step 4: Run the tests and look at it**

Run: `npm test`
Expected: `ℹ fail 0`

With `npm start`, scroll to the principles section at 1440×900 with the mouse away from the heading. The eyebrow and heading read cleanly, and the lens still lights the digits under the cursor. If the label is still hard to read, lower `0.1` to `0.06` and update the test to match.

- [ ] **Step 5: Commit**

```bash
git add styles.css tests/homepage-style.test.mjs
git commit -m "fix: keep the principles heading readable over its number field

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VD5ManwFwMf8hH1aJdZoBe"
```

---

### Task 3: Say what Netria builds and how a project runs

Adds a one-line hero summary and restores the process section (`id="approach"`, so links from before the pager land on it), with deliverables a buyer can picture. Renumbers the eyebrows.

**Files:**
- Modify: `index.html` (hero, new section between capabilities and principles, eyebrows), `styles.css` (hero summary, process list, responsive rules)
- Test: `tests/homepage-content.test.mjs`, `tests/homepage-style.test.mjs`

**Interfaces:**
- Consumes: Owner inputs `«HERO_SUMMARY»`, `«PROCESS_HEADING»`, `«STEP_1»`–`«STEP_4»`.
- Produces: section order `top, capabilities, approach, principles, contact`, with eyebrows `01`–`05`.

- [ ] **Step 1: Write the failing tests**

In `tests/homepage-content.test.mjs`, replace the whole `test("contains the approved dual-track content structure", ...)` block with:

```js
test("says what Netria builds and how a project runs", () => {
  const ids = [...html.matchAll(/<section[^>]+id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ["top", "capabilities", "approach", "principles", "contact"]);
  const eyebrows = [...html.matchAll(/<p class="eyebrow"><span>(\d\d)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(eyebrows, ["01", "02", "03", "04", "05"]);

  assert.match(authoredText, /Software for ideas and operations in motion\./);
  assert.match(html, /<\/h1>\s*<p class="hero-summary">[^<]{40,}<\/p>/);
  assert.match(html, /Build a product/);
  assert.match(html, /Improve a system/);

  const approach = html.slice(html.indexOf('id="approach"'), html.indexOf('id="principles"'));
  const steps = [...approach.matchAll(/<li>\s*<span>0\d<\/span>\s*<div>\s*<h3>([^<]+)<\/h3>\s*<p>[^<]{30,}<\/p>/g)];
  assert.deepEqual(steps.map((m) => m[1]), ["Frame the problem", "Prototype the path", "Build and validate", "Release and hand over"]);
  assert.doesNotMatch(html, /«/, "an owner input was left unfilled");
});
```

In `tests/homepage-style.test.mjs`, add:

```js
test("the process list stacks on tablets and keeps a narrow index column on phones", () => {
  assert.match(css, /\.hero-summary\s*\{/);
  assert.match(css, /\.approach-list li\s*\{[^}]*grid-template-columns:\s*minmax\(70px, 0\.25fr\) minmax\(0, 1fr\)/s);
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*\.capability-grid,\s*\.approach-list div\s*\{\s*grid-template-columns:\s*1fr;/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)[\s\S]*\.approach-list li\s*\{\s*grid-template-columns:\s*42px 1fr;/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/homepage-content.test.mjs tests/homepage-style.test.mjs`
Expected: FAIL in `says what Netria builds and how a project runs` and `the process list stacks on tablets and keeps a narrow index column on phones`.

- [ ] **Step 3: Edit `index.html`**

In the hero, insert the summary between the `<h1>` and `<div class="hero-actions">`:

```html
                <h1>Software for ideas and operations <em>in motion.</em></h1>
                <p class="hero-summary">«HERO_SUMMARY»</p>
                <div class="hero-actions">
```

Insert this section between the capabilities `</section>` and `<section class="section principles scene" id="principles">`:

```html
        <section class="section approach" id="approach">
            <div class="section-heading">
                <p class="eyebrow"><span>03</span> How a project runs</p>
                <h2>«PROCESS_HEADING»</h2>
            </div>

            <ol class="approach-list">
                <li>
                    <span>01</span>
                    <div>
                        <h3>Frame the problem</h3>
                        <p>«STEP_1»</p>
                    </div>
                </li>
                <li>
                    <span>02</span>
                    <div>
                        <h3>Prototype the path</h3>
                        <p>«STEP_2»</p>
                    </div>
                </li>
                <li>
                    <span>03</span>
                    <div>
                        <h3>Build and validate</h3>
                        <p>«STEP_3»</p>
                    </div>
                </li>
                <li>
                    <span>04</span>
                    <div>
                        <h3>Release and hand over</h3>
                        <p>«STEP_4»</p>
                    </div>
                </li>
            </ol>
        </section>

```

Renumber: `<p class="eyebrow"><span>03</span> Working principles</p>` becomes `<span>04</span>`, and `<p class="eyebrow"><span>04</span> Open a channel</p>` becomes `<span>05</span>`.

- [ ] **Step 4: Edit `styles.css`**

After the `.hero-copy { ... }` rule, add (restored from `cb7c93e^`):

```css
.hero-summary {
    max-width: 56ch;
    margin-bottom: 2rem;
    color: var(--color-muted);
    font-size: clamp(1rem, 1.6vw, 1.2rem);
}
```

After the last `.principle-grid p { ... }` rule outside media queries, add (restored from `2f79e8e^`):

```css
.approach-list {
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--color-border);
    list-style: none;
}

.approach-list li {
    display: grid;
    grid-template-columns: minmax(70px, 0.25fr) minmax(0, 1fr);
    gap: 1rem;
    padding: 2rem 0;
    border-bottom: 1px solid var(--color-border);
}

.approach-list > li > span {
    color: var(--color-signal);
    font-family: var(--font-pixel);
    font-size: 0.75rem;
}

.approach-list div {
    display: grid;
    grid-template-columns: minmax(220px, 0.7fr) minmax(240px, 1fr);
    gap: 2rem;
}

.approach-list h3 {
    margin-bottom: 0;
    font-size: clamp(1.2rem, 2vw, 1.7rem);
    font-weight: 400;
}

.approach-list p {
    max-width: 52ch;
    margin-bottom: 0;
    color: var(--color-muted);
}
```

In `@media (max-width: 900px)`, change:

```css
    .section-heading,
    .capability-grid {
        grid-template-columns: 1fr;
    }
```

to:

```css
    .section-heading,
    .capability-grid,
    .approach-list div {
        grid-template-columns: 1fr;
    }
```

In `@media (max-width: 600px)`, after the `.principle-grid { grid-template-columns: 1fr; }` rule, add:

```css
    .approach-list li {
        grid-template-columns: 42px 1fr;
    }
```

- [ ] **Step 5: Run the tests**

Run: `npm test`
Expected: `ℹ fail 0`

- [ ] **Step 6: Check 320px and 1440px**

With `npm start`, set the window to 320px wide. The process steps stack, nothing scrolls sideways (`document.documentElement.scrollWidth === innerWidth`), and the hero summary wraps under the headline. At 1440px, each step's title and text sit side by side.

- [ ] **Step 7: Commit**

```bash
git add index.html styles.css tests/homepage-content.test.mjs tests/homepage-style.test.mjs
git commit -m "feat: say what Netria builds and how a project runs

Restores the hero summary and the process section the scene pager
squeezed out, with what a client gets at each step.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VD5ManwFwMf8hH1aJdZoBe"
```

---

### Task 4: Name the person a visitor will work with

Adds a founder block to the contact section, names the founder in the structured data, rewrites the contact heading, and links article bylines to the block. This also closes the README "To do".

**Files:**
- Modify: `index.html` (contact section, JSON-LD), `styles.css` (founder block), `_includes/article.njk:8`, `articles/2026-10-08-decision-models.md:9`, `README.md` (To do)
- Test: `tests/homepage-content.test.mjs`, `tests/articles.test.mjs`

**Interfaces:**
- Consumes: Owner inputs `«FOUNDER_NAME»`, `«FOUNDER_ROLE»`, `«FOUNDER_BIO»`, `«LINKEDIN_URL»`, `«REPLY_LINE»`.
- Produces: `id="founder"` on the founder block, and JSON-LD `founder["@id"] === "https://www.netria.dev/#founder"`, which article `author.url` points to.

- [ ] **Step 1: Write the failing tests**

Add to `tests/homepage-content.test.mjs`:

```js
test("names the person a visitor will work with", () => {
  const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
  const founder = main.slice(main.indexOf('id="founder"'));
  assert.match(founder, /<p class="founder-name">[^<]+<span>[^<]+<\/span><\/p>\s*<p>[^<]{60,}<\/p>/);
  assert.match(founder, /<a href="https:\/\/www\.linkedin\.com\/in\/[^"]+">LinkedIn/);
  assert.ok(main.indexOf('id="founder"') > main.indexOf('id="contact"'), "founder sits in the contact section");
  assert.doesNotMatch(main, /forward motion|«/);

  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const org = ld["@graph"].find((node) => node["@type"] === "Organization");
  assert.equal(org.founder["@type"], "Person");
  assert.equal(org.founder["@id"], "https://www.netria.dev/#founder");
  assert.match(org.founder.sameAs[0], /^https:\/\/www\.linkedin\.com\/in\//);
});
```

Add to `tests/articles.test.mjs`:

```js
test("article bylines link to the founder on the homepage", () => {
  const page = readFileSync(join(out, "articles/decision-models/index.html"), "utf8");
  assert.match(page, /By <a href="https:\/\/www\.netria\.dev\/#founder">[^<]+<\/a>/);
  assert.match(page, /"url": "https:\/\/www\.netria\.dev\/#founder"/);
  assert.doesNotMatch(read("README.md"), /## To do/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL in `names the person a visitor will work with` and `article bylines link to the founder on the homepage`.

- [ ] **Step 3: Edit `index.html`**

Replace the contact section's opening `<div> ... </div>`:

```html
            <div>
                <p class="eyebrow"><span>05</span> Open a channel</p>
                <h2>Have an idea or operation that needs forward motion?</h2>
            </div>
```

with:

```html
            <div>
                <p class="eyebrow"><span>05</span> Start here</p>
                <h2>Tell us what you want to build or fix.</h2>
                <p>«REPLY_LINE»</p>
            </div>

            <div class="founder" id="founder">
                <p class="founder-name">«FOUNDER_NAME»<span>«FOUNDER_ROLE»</span></p>
                <p>«FOUNDER_BIO»</p>
                <a href="«LINKEDIN_URL»">LinkedIn <span aria-hidden="true">↗</span></a>
            </div>
```

In the JSON-LD `Organization` object, add a `founder` after `"email": "hello@netria.dev",`:

```json
                    "email": "hello@netria.dev",
                    "founder": {
                        "@type": "Person",
                        "@id": "https://www.netria.dev/#founder",
                        "name": "«FOUNDER_NAME»",
                        "jobTitle": "«FOUNDER_ROLE»",
                        "sameAs": ["«LINKEDIN_URL»"]
                    },
```

- [ ] **Step 4: Edit `styles.css`**

After the `.contact > div > p:last-child { ... }` rule, add:

```css
.founder {
    max-width: 52ch;
    margin-top: 2.5rem;
    padding-left: 1rem;
    border-left: 2px solid var(--color-border-strong);
}

.founder-name {
    margin: 0 0 0.5rem;
    font-family: var(--font-pixel);
    font-size: 1.1rem;
}

.founder-name span {
    display: block;
    margin-top: 0.25rem;
    color: var(--color-dim);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.founder a {
    color: var(--color-signal);
    font-family: var(--font-mono);
    font-size: 0.8rem;
}
```

- [ ] **Step 5: Link the byline**

In `articles/2026-10-08-decision-models.md`, under `author:`, replace the comment line that starts `# TODO: add` (it points at the README "To do") with:

```yaml
    url: https://www.netria.dev/#founder
```

In `_includes/article.njk`, replace:

```njk
            {% if author %}<span>By {{ author.name }}{% if author.role %}, {{ author.role }}{% endif %}</span>{% endif %}
```

with:

```njk
            {% if author %}<span>By {% if author.url %}<a href="{{ author.url }}">{{ author.name }}</a>{% else %}{{ author.name }}{% endif %}{% if author.role %}, {{ author.role }}{% endif %}</span>{% endif %}
```

In `README.md`, delete the whole `## To do` section (its heading, its single bullet and the blank line after). In **Writing Articles**, after `adds a byline and names that person in the structured data`, add `(set \`url: https://www.netria.dev/#founder\` to link the byline to the founder block on the homepage)`.

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: `ℹ fail 0`

- [ ] **Step 7: Check it**

With `npm start`: at 1440px the founder block sits under the contact heading, left-ruled, and the LinkedIn link opens the right profile. At 320px nothing overflows. On `http://localhost:8080/articles/decision-models/`, the byline name links to `/#founder` and lands on the block.

- [ ] **Step 8: Commit**

```bash
git add index.html styles.css _includes/article.njk articles/2026-10-08-decision-models.md README.md tests/homepage-content.test.mjs tests/articles.test.mjs
git commit -m "feat: name the person a visitor will work with

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VD5ManwFwMf8hH1aJdZoBe"
```

---

### Task 5: Make the first email easy

Every homepage email link opens with a short brief. A "Copy address" button covers visitors whose browser opens no mail app (webmail users). The button shares the clipboard handler the article `#` links already use.

**Files:**
- Modify: `index.html` (three `mailto:` links, the copy button), `script.js` (copy handler), `styles.css` (button, tooltip, no-JS), `README.md` (Contact)
- Test: `tests/homepage-content.test.mjs`, `tests/homepage-behavior.test.mjs`, `tests/homepage-style.test.mjs`, `tests/articles.test.mjs`

**Interfaces:**
- Consumes: from Task 0, `script.js` code that builds `.copy-status` and sets `data-copied` on `.heading-link` elements.
- Produces: any element with `data-copy="<text>"` copies that text on click.

- [ ] **Step 1: Write the failing tests**

Add to `tests/homepage-content.test.mjs`:

```js
test("every email action opens a short brief, and the address can be copied", () => {
  const mailtos = [...html.matchAll(/href="(mailto:[^"]+)"/g)].map((m) => m[1]);
  assert.equal(mailtos.length, 3);
  for (const href of mailtos) {
    // %20 and %0D%0A, never "+": some mail apps show a literal plus.
    assert.doesNotMatch(href, /\+/);
    const url = new URL(href.replaceAll("&amp;", "&"));
    assert.equal(url.pathname, "hello@netria.dev");
    assert.equal(url.searchParams.get("subject"), "Project conversation");
    assert.equal(
      url.searchParams.get("body"),
      "What do you want to build or fix?\r\n\r\n\r\nWhen do you need it?\r\n\r\n\r\nRough budget, if you have one:\r\n"
    );
  }
  assert.match(html, /<button type="button" class="copy-email" data-copy="hello@netria\.dev">Copy address<\/button>/);
});
```

Add to `tests/homepage-behavior.test.mjs`:

```js
test("copy buttons and section links share one clipboard handler that fails quietly", () => {
  assert.match(script, /querySelectorAll\("\.heading-link, \[data-copy\]"\)/);
  assert.match(script, /const text = el\.dataset\.copy \?\? location\.origin \+ location\.pathname \+ el\.hash;/);
  assert.match(script, /navigator\.clipboard\.writeText\(text\)/);
  assert.match(script, /\} catch \{/);
});
```

Add to `tests/homepage-style.test.mjs`:

```js
test("the copy button hides without JavaScript and confirms a copy", () => {
  assert.match(css, /\.no-js \.copy-email\s*\{\s*display:\s*none;/);
  assert.match(css, /\.article-body \.heading-link\[data-copied\]::after,\s*\.copy-email\[data-copied\]::after\s*\{/);
});
```

In `tests/articles.test.mjs`, in `test("article sections carry ids and a link that copies their address", ...)`, replace:

```js
  assert.match(read("script.js"), /navigator\.clipboard\.writeText\(location\.origin \+ location\.pathname \+ link\.hash\)/);
```

with:

```js
  assert.match(read("script.js"), /location\.origin \+ location\.pathname \+ el\.hash/);
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL in `every email action opens a short brief, and the address can be copied`, `copy buttons and section links share one clipboard handler that fails quietly`, `the copy button hides without JavaScript and confirms a copy`, and `article sections carry ids and a link that copies their address`.

- [ ] **Step 3: Edit `index.html`**

Replace all three occurrences of `href="mailto:hello@netria.dev?subject=Project%20conversation"` (header, hero and contact) with:

```
href="mailto:hello@netria.dev?subject=Project%20conversation&amp;body=What%20do%20you%20want%20to%20build%20or%20fix%3F%0D%0A%0D%0A%0D%0AWhen%20do%20you%20need%20it%3F%0D%0A%0D%0A%0D%0ARough%20budget%2C%20if%20you%20have%20one%3A%0D%0A"
```

(`&amp;` is the correct way to write `&` in an HTML attribute. The test reads the raw file and converts it back before parsing.)

Directly after the contact section's `</a>` that closes `.contact-link`, add:

```html
            <button type="button" class="copy-email" data-copy="hello@netria.dev">Copy address</button>
```

- [ ] **Step 4: Edit `script.js`**

Replace the whole block from the comment `// Articles: a section's "#" link copies the section's address instead of jumping to it.` to the end of the file with:

```js
// Copy without leaving the page: an article section's "#" link copies its address, and a
// [data-copy] button copies its value (the contact email).
const copyTargets = document.querySelectorAll(".heading-link, [data-copy]");

if (copyTargets.length) {
    const status = document.createElement("p");
    status.className = "copy-status";
    status.setAttribute("role", "status");
    document.body.append(status);

    copyTargets.forEach((el) => {
        el.addEventListener("click", async (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }
            event.preventDefault();
            const text = el.dataset.copy ?? location.origin + location.pathname + el.hash;
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                // No clipboard access: a section link goes to the address bar instead; the
                // email stays visible and selectable beside its button.
                if (el.hash) {
                    history.replaceState(null, "", el.hash);
                }
                return;
            }
            el.dataset.copied = "";
            status.textContent = "Copied";
            clearTimeout(el.copiedTimer);
            el.copiedTimer = setTimeout(() => {
                delete el.dataset.copied;
                status.textContent = "";
            }, 2000);
        });
    });
}
```

- [ ] **Step 5: Edit `styles.css`**

Change the selector `.article-body .heading-link[data-copied]::after {` to:

```css
.article-body .heading-link[data-copied]::after,
.copy-email[data-copied]::after {
```

After the `.contact-link [aria-hidden] { ... }` rule, add:

```css
.copy-email {
    position: relative;
    margin-top: 1rem;
    padding: 0.55rem 0.9rem;
    border: 1px solid var(--color-border-strong);
    background: transparent;
    color: var(--color-signal);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    cursor: pointer;
}

.copy-email:hover {
    background: rgba(99, 255, 114, 0.06);
}

/* Without JavaScript the button would do nothing: the address beside it is selectable */
.no-js .copy-email {
    display: none;
}
```

- [ ] **Step 6: Update the README**

In `README.md`, under **Contact**, after the first sentence, add: `Every homepage email link opens with three short prompts (what, when, budget), and a Copy address button helps visitors whose browser opens no mail app.`

- [ ] **Step 7: Run the tests and size check**

Run: `npm test && node --check script.js && wc -c script.js`
Expected: `ℹ fail 0`, and a byte count under 5000.

- [ ] **Step 8: Check it**

With `npm start`:
- Click **Copy address**. A "Copied" tag appears above the button for two seconds, and pasting gives `hello@netria.dev`.
- Click **Start a conversation**. The mail app opens with the subject and three prompts on separate lines.
- On an article, the `#` section links still copy their address.
- Disable JavaScript in DevTools and reload. The button is gone and the mail links still work.

- [ ] **Step 9: Commit**

```bash
git add index.html script.js styles.css README.md tests/
git commit -m "feat: make the first email easy

Email links open with a three-line brief, and a Copy address button
covers browsers that open no mail app.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VD5ManwFwMf8hH1aJdZoBe"
```

---

## Final checks (before merging)

- [ ] `npm test && npm run build && node --check script.js && node --check signal.js && git diff main --check`. Expected: `ℹ fail 0`, and a clean build.
- [ ] With `npm start`, at 320, 768, 1024 and 1440px wide: no horizontal scroll, every section readable, and the founder block and process list laid out cleanly.
- [ ] Keyboard only: Tab reaches the skip link, Articles, Email Netria, Start a conversation, the LinkedIn link, the email link and Copy address, each with a visible green focus ring.
- [ ] DevTools → Rendering → `prefers-reduced-motion: reduce`: no WebGPU layers, static moth shown, page fully usable.
- [ ] Open `/#principles`, `/#approach` and `/#contact` directly. Each lands with its eyebrow below the header.
- [ ] The owner reads the whole page once as a buyer would, and confirms every commitment in the copy (price per step, delivery cadence, handover, reply time).
- [ ] The owner decides how to merge: push `main` to deploy, or open a PR.
