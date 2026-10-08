// Scene fx: one WebGPU layer per homepage scene (shaders.com), each tuned to a piece of
// green-phosphor screen culture, plus the article divider trace. Progressive: the static page
// stays unless WebGPU, a fine pointer and motion all line up, and any layer that fails just
// removes its canvas. Pages with no layer host never download the bundle.
// Pinned by an import-map integrity hash in index.html: bump both together.
const SHADERS_URL = "https://cdn.jsdelivr.net/npm/shaders@4.0.0/dist/js/bundle.js";
const GREEN = "#63ff72";
const MOTH = new URL("/assets/netria-logo-navbar-transparent.png", location.href).href;

const scope = (amplitude, speed) => [
    {
        type: "Glow",
        props: { intensity: 3, threshold: 0.1, size: 10 },
        children: [
            {
                type: "Waveform",
                id: "scope",
                props: { style: "line", colorA: GREEN, colorB: GREEN, amplitude, frequency: 1.4, height: 0.8, lineWidth: 0.02, speed, align: "mirrored" },
            },
        ],
    },
];

const LAYERS = [
    {
        // 01 · An LED-matrix moth the cursor scatters.
        host: ".hero-signal",
        live: "signal-live",
        components: [
            {
                type: "Pixelate",
                props: { scale: 76, gap: 0.18 },
                children: [
                    {
                        type: "PixelThrow",
                        props: { strength: 1, keyInfluence: 0, radius: 0.3, friction: 0.08, momentum: 0.85, edges: "transparent" },
                        children: [{ type: "ImageTexture", props: { url: MOTH, objectFit: "contain", transform: { scale: 0.54 } } }],
                    },
                ],
            },
            { type: "Glitch", props: { intensity: 0.35, speed: 0.6, rgbShift: 3, colorBarIntensity: 0, mirrorAmount: 0 } },
        ],
    },
    {
        // 02 · Tron: the Grid, rolling toward a horizon; the cursor cuts a light-cycle wake.
        host: "#capabilities",
        components: [
            {
                type: "Perspective",
                props: { tilt: 66, fov: 100, zoom: 1.6, center: { x: 0.5, y: 0.3 } },
                children: [{ type: "Grid", id: "floor", props: { color: GREEN, cells: 12, thickness: 1.2 } }],
            },
            { type: "CursorRipples", props: { intensity: 8, decay: 6, radius: 0.4, chromaticSplit: 1.5, edges: "transparent" } },
            { type: "Glow", props: { intensity: 2, threshold: 0.2, size: 12 } },
        ],
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
    },
    {
        // 03 · Severance: Macrodata Refinement. Drifting clusters of numbers; the cursor is the
        // magnifying lens, and only the digits under it light up.
        host: "#principles",
        components: [
            {
                type: "Bulge",
                props: { center: { type: "mouse-position", smoothing: 0.2 }, strength: 0.7, radius: 0.6, falloff: 1 },
                children: [
                    {
                        type: "Ascii",
                        props: { characters: "9876543210", cellSize: 26, fontFamily: "VT323" },
                        children: [
                            { type: "SimplexNoise", props: { colorA: GREEN, colorB: "#0d2410", scale: 0.6, speed: 0.35, contrast: 0.5 } },
                            { type: "BlueNoise", props: { grain: 2, blendMode: "overlay", opacity: 0.8 } },
                        ],
                    },
                ],
            },
        ],
        // The spotlight is a CSS mask (styles.css) centred on the cursor.
        wire(shader, host, canvas) {
            host.addEventListener("pointermove", (e) => {
                const r = canvas.getBoundingClientRect();
                canvas.style.setProperty("--mx", `${e.clientX - r.left}px`);
                canvas.style.setProperty("--my", `${e.clientY - r.top}px`);
            });
        },
    },
    {
        // 04 · Contact: an oscilloscope trace that locks on when you reach for the email link.
        host: ".contact-scope",
        live: "signal-live",
        components: scope(0.35, 0.8),
        wire(shader, host) {
            const link = host.closest("a");
            const hot = (on) => () => shader.update("scope", { amplitude: on ? 1.6 : 0.35, frequency: on ? 2.6 : 1.4 });
            for (const [ev, on] of [["pointerenter", 1], ["pointerleave", 0], ["focus", 1], ["blur", 0]]) {
                link.addEventListener(ev, hot(on));
            }
        },
    },
    {
        // Articles: the same trace, calmer, as the divider between the intro and the body.
        host: ".article-scope",
        live: "signal-live",
        components: scope(0.25, 0.4),
    },
];

const present = (layer) => document.querySelector(layer.host)?.offsetWidth > 0;

async function mountLayer({ host: selector, live, components, wire }, createShader, gpu) {
    const host = document.querySelector(selector);
    const scene = host.closest(".scene");
    const canvas = document.createElement("canvas");
    canvas.className = "scene-fx";
    canvas.style.width = canvas.style.height = "100%";
    host.prepend(canvas);

    const fail = () => {
        canvas.remove();
        live && host.classList.remove(live);
    };
    let shader = null;
    shader = await createShader(canvas, { components }, {
        gpu,
        disableTelemetry: true,
        onReady: () => live && host.classList.add(live),
        // Recoverable device losses also land here; only a terminal failure drops the canvas.
        onError: () => shader?.getFailureReason() && fail(),
    }).catch(fail);
    if (!shader || shader.getFailureReason()) {
        fail();
        return;
    }
    wire?.(shader, host, canvas);

    // Stacked scenes all look visible to the renderer: only draw while the owning one is on
    // screen. Outside the pager the renderer already pauses layers scrolled out of view.
    if (scene) {
        const sync = () => (scene.matches(".scene--active, .scene--entering") ? shader.resume() : shader.pause());
        new MutationObserver(sync).observe(scene, { attributes: true, attributeFilter: ["class"] });
        sync();
    }
}

async function mount() {
    const layers = LAYERS.filter(present);
    if (!layers.length) {
        return;
    }
    const { createShader, createSharedDevice } = await import(SHADERS_URL);
    const gpu = (await createSharedDevice()) || undefined;
    await Promise.all(layers.map((layer) => mountLayer(layer, createShader, gpu).catch(() => {})));
}

if (
    "gpu" in navigator &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
    // After load: the bundle never competes with the page's own text, fonts and images.
    const start = () => mount().catch(() => {});
    document.readyState === "complete" ? start() : window.addEventListener("load", start, { once: true });
}
