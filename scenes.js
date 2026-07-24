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
const CLIP_STEPS = 24;

let active = 0;
let busy = false;
let target = 0;
let dir = "forward";
let p = 0;
let goal = 1;
let fromPop = false;

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
    if (fromPop) {
        fromPop = false;
        return;
    }
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
    fromPop = false;
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
            requestReverse();
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
    if (busy || i === active || i < 0 || i >= scenes.length) {
        return;
    }
    fromPop = true;
    goTo(i, i > active ? "forward" : "backward");
}

if (JS && scenes.length > 1) {
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeydown);
    document.addEventListener("click", onDocClick);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("resize", onResize);
    settleTo(hashIndex());
    enterScene(active, 0);
}

window.__scenes = { active: () => active, goTo };
