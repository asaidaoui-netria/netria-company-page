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
