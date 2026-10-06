// Scene fx: one WebGPU layer per scene (shaders.com), each tuned to a piece of green-phosphor
// screen culture. Progressive: the static page stays unless WebGPU, a fine pointer and motion
// all line up, and any layer that fails just removes its canvas.
const SHADERS_URL = "https://cdn.jsdelivr.net/npm/shaders@4.0.0/dist/js/bundle.js";
const GREEN = "#63ff72";
const MOTH = new URL("assets/netria-logo-navbar-transparent.png", location.href).href;

const LAYERS = [
    {
        // 01 · The Matrix: glyph rain behind an LED-matrix moth the cursor scatters.
        host: ".hero-signal",
        live: "signal-live",
        components: [
            {
                type: "Ascii",
                props: { characters: "@#$%&*NETRIA0123456789", cellSize: 22, fontFamily: "Silkscreen", gamma: 0.8 },
                children: [
                    {
                        type: "FallingLines",
                        props: { colorA: "#2f9a3c", colorB: "#2f9a3c00", angle: 90, speed: 0.35, speedVariance: 0.6, density: 22, trailLength: 0.8, strokeWidth: 1, rounding: 0 },
                    },
                ],
            },
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
        components: [
            {
                type: "Glow",
                props: { intensity: 3, threshold: 0.1, size: 10 },
                children: [
                    {
                        type: "Waveform",
                        id: "scope",
                        props: { style: "line", colorA: GREEN, colorB: GREEN, amplitude: 0.35, frequency: 1.4, height: 0.8, lineWidth: 0.02, speed: 0.8, align: "mirrored" },
                    },
                ],
            },
        ],
        wire(shader, host) {
            const link = host.closest("a");
            const hot = (on) => () => shader.update("scope", { amplitude: on ? 1.6 : 0.35, frequency: on ? 2.6 : 1.4 });
            for (const [ev, on] of [["pointerenter", 1], ["pointerleave", 0], ["focus", 1], ["blur", 0]]) {
                link.addEventListener(ev, hot(on));
            }
        },
    },
];

async function mountLayer({ host: selector, live, components, wire }, createShader, gpu) {
    const host = document.querySelector(selector);
    const scene = host?.closest(".scene");
    if (!host || !scene || host.offsetWidth === 0) {
        return;
    }
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

    // Only draw while the owning scene is on screen.
    const sync = () => (scene.matches(".scene--active, .scene--entering") ? shader.resume() : shader.pause());
    new MutationObserver(sync).observe(scene, { attributes: true, attributeFilter: ["class"] });
    sync();
}

async function mount() {
    const { createShader, createSharedDevice } = await import(SHADERS_URL);
    const gpu = (await createSharedDevice()) || undefined;
    await Promise.all(LAYERS.map((layer) => mountLayer(layer, createShader, gpu).catch(() => {})));
}

if (
    "gpu" in navigator &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
    mount().catch(() => {});
}
