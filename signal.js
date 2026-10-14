// Scene fx: WebGPU oscilloscope traces (shaders.com) on the homepage contact link and the
// article divider. The hero moth lives in pixels.js. Progressive: the static page
// stays unless WebGPU, a fine pointer and motion all line up, and any layer that fails just
// removes its canvas. Pages with no layer host never download the bundle.
// Pinned by an import-map integrity hash in index.html: bump both together.
const SHADERS_URL = "https://cdn.jsdelivr.net/npm/shaders@4.0.0/dist/js/bundle.js";
const GREEN = "#63ff72";

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
        // Contact: an oscilloscope trace that locks on when you reach for the email link.
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
    // The renderer slows layers scrolled out of view to about one frame a second.
    wire?.(shader, host, canvas);
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
