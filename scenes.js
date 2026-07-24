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
