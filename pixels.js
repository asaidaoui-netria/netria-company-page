// Moth pixels: the hero moth's LED pixels follow the visitor down the homepage. They scatter as
// the hero leaves, draw an app window and a node diagram behind the two capability cards, pour
// into the four process dividers, and rebuild the moth at the contact. One fixed WebGL2 canvas
// behind the page, driven by scroll. Without WebGL2, or with reduced motion, the static page stays.
const MOTH = "/assets/netria-logo-navbar-transparent.png";
const GRID = 40; // the moth is sampled as a 40×40 LED matrix
const SPACING = 9; // px between pixels in the card shapes
const EASE = 0.08; // share of the way to the scroll target covered each frame

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const box = (el) => el.getBoundingClientRect();
const clamp = (v) => Math.min(1, Math.max(0, v));

// Lit LEDs of the moth: position in the moth (−0.5…0.5) and colour.
async function mothPixels() {
    const img = new Image();
    img.src = MOTH;
    await img.decode();
    const probe = document.createElement("canvas");
    probe.width = probe.height = GRID;
    const ctx = probe.getContext("2d");
    ctx.drawImage(img, 0, 0, GRID, GRID);
    const rgba = ctx.getImageData(0, 0, GRID, GRID).data;
    const lit = [];
    for (let i = 0; i < rgba.length; i += 4) {
        const x = (i / 4) % GRID, y = Math.floor(i / 4 / GRID);
        if (rgba[i + 3] >= 128) lit.push([x / GRID - 0.5, y / GRID - 0.5, rgba[i] / 255, rgba[i + 1] / 255, rgba[i + 2] / 255]);
    }
    return lit;
}

// Card shapes, in CSS px from the card's top-left corner.
function line(out, ax, ay, bx, by) {
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / SPACING));
    for (let i = 0; i < n; i++) out.push([ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n]);
}

function block(out, cx, cy, size) {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) out.push([cx + (x - size / 2 + 0.5) * 6, cy + (y - size / 2 + 0.5) * 6]);
    }
}

// "Build a product": an app window with a title bar, a sidebar and lines of content.
function appWindow(w, h) {
    const pts = [], x0 = w * 0.08, x1 = w * 0.92, y0 = h * 0.1, y1 = h * 0.9, bar = y0 + 30;
    line(pts, x0, y0, x1, y0);
    line(pts, x1, y0, x1, y1);
    line(pts, x1, y1, x0, y1);
    line(pts, x0, y1, x0, y0);
    line(pts, x0, bar, x1, bar);
    for (const dx of [14, 28, 42]) block(pts, x0 + dx, y0 + 15, 2);
    const side = x0 + (x1 - x0) * 0.24;
    line(pts, side, bar, side, y1);
    [0.82, 0.6, 0.72, 0.45].forEach((len, i) => {
        const y = bar + 32 + i * 28;
        if (y < y1 - 12) line(pts, side + 22, y, side + 22 + (x1 - side - 44) * len, y);
    });
    return pts;
}

// "Improve a system": five nodes and the links between them.
function nodeGraph(w, h) {
    const nodes = [[0.18, 0.3], [0.5, 0.18], [0.82, 0.32], [0.32, 0.74], [0.7, 0.78]].map(([x, y]) => [x * w, y * h]);
    const pts = [];
    for (const [a, b] of [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [1, 4]]) {
        const [ax, ay] = nodes[a], [bx, by] = nodes[b], d = Math.hypot(bx - ax, by - ay);
        const ux = (bx - ax) / d, uy = (by - ay) / d;
        line(pts, ax + ux * 22, ay + uy * 22, bx - ux * 22, by - uy * 22);
    }
    for (const [x, y] of nodes) block(pts, x, y, 4);
    return pts;
}

// Spread a shape over its share of the pixels: thin it when too dense; spare pixels keep drifting.
const share = (shape, slots) => (j) => shape[Math.floor(j * Math.max(1, shape.length / slots))] ?? null;

const VS = `#version 300 es
in vec2 aHome; in vec4 aRand; in vec3 aCol;
in vec3 aCap;   // px from its card's top-left, card 0 or 1; card -1 keeps drifting
in vec2 aDiv;   // position along its divider 0-1, divider 0-3
uniform vec2 uRes; uniform float uTime, uScatter, uGather, uDpr, uCap;
uniform vec3 uHero, uDock; uniform vec2 uPointer;
uniform vec4 uCardL, uCardR, uRows, uFill; uniform vec2 uRowX;
out vec3 vCol;
void main() {
    vec2 hero = uHero.xy + aHome * uHero.z;
    vec2 dock = uDock.xy + aHome * uDock.z;
    vec2 drift = aRand.xy * uRes + vec2(sin(uTime * .3 + aRand.z * 6.28), cos(uTime * .23 + aRand.w * 6.28)) * 50. * uDpr;
    float s = smoothstep(aRand.z * .5, aRand.z * .5 + .5, uScatter);
    vec2 p = mix(hero, drift, s);

    float c = 0.;
    if (aCap.z >= 0.) {
        vec4 card = aCap.z < .5 ? uCardL : uCardR;
        c = smoothstep(aRand.x * .4, aRand.x * .4 + .6, uCap);
        p = mix(p, card.xy + aCap.xy * uDpr, c);
    }

    int k = int(aDiv.y);
    float f = smoothstep(aDiv.x * .6, aDiv.x * .6 + .4, uFill[k]);   // pours in left to right
    p = mix(p, vec2(uRowX.x + aDiv.x * uRowX.y, uRows[k]), f);

    float g = smoothstep(aRand.w * .5, aRand.w * .5 + .5, uGather);
    p = mix(p, dock, g);

    vec2 away = p - uPointer; float dist = length(away);
    p += away / max(dist, 1.) * 70. * exp(-dist / (90. * uDpr)) * uDpr;
    gl_Position = vec4(p / uRes * 2. - 1., 0, 1);
    gl_Position.y *= -1.;
    float formed = max(max(c, f), g);
    gl_PointSize = mix(uHero.z, uDock.z, g) / ${GRID}. * .82 * mix(.7, 1., max(formed, 1. - s));
    vCol = aCol * mix(1., 1.35, max(f, c * 1.4) * (1. - g));
}`;

const FS = `#version 300 es
precision highp float;
in vec3 vCol; out vec4 o;
void main() { o = vec4(vCol, 1.); }`;

function compile(gl) {
    const prog = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]]) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        gl.attachShader(prog, shader);
    }
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    return prog;
}

// Where the moth lands: beside the founder on wide screens, beside the copy button on phones.
function dock(contact) {
    if (contact.width >= 700) {
        return [contact.right - contact.width * 0.22, contact.top + contact.height * 0.52, Math.min(contact.width * 0.3, 260)];
    }
    const button = box($(".copy-email"));
    const size = 72;
    return [contact.right - size, button.top + button.height / 2, size];
}

// Hand the page back to its static art: after a failed start, a lost GPU context or a failed frame.
let stopped = false;
function stop() {
    stopped = true;
    $(".pixel-field")?.remove();
    document.documentElement.classList.remove("pixels-live");
    $(".hero-signal")?.classList.remove("signal-live");
}

async function start() {
    const canvas = document.createElement("canvas");
    canvas.className = "pixel-field";
    canvas.setAttribute("aria-hidden", "true");
    canvas.addEventListener("webglcontextlost", stop);
    const gl = canvas.getContext("webgl2", { antialias: false });
    if (!gl) return;
    const moth = await mothPixels();
    const prog = compile(gl);
    const N = moth.length;
    const rand = moth.map(() => [Math.random(), Math.random(), Math.random(), Math.random()]);

    const STRIDE = 14;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    for (const [name, size, offset] of [["aHome", 2, 0], ["aRand", 4, 2], ["aCol", 3, 6], ["aCap", 3, 9], ["aDiv", 2, 12]]) {
        const loc = gl.getAttribLocation(prog, name);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, STRIDE * 4, offset * 4);
    }

    const cards = $$(".capability-card");
    const steps = $$(".approach-list > li");
    const build = () => {
        const [a, b] = cards.map(box);
        const shapes = [share(appWindow(a.width, a.height), N / 2), share(nodeGraph(b.width, b.height), N / 2)];
        const perLine = Math.ceil(N / 4);
        const data = new Float32Array(N * STRIDE);
        moth.forEach(([hx, hy, r, g, bl], i) => {
            const target = shapes[i % 2](Math.floor(i / 2));
            const along = Math.floor(i / 4) / (perLine - 1);
            data.set([hx, hy, ...rand[i], r, g, bl, target?.[0] ?? 0, target?.[1] ?? 0, target ? i % 2 : -1, along, i % 4], i * STRIDE);
        });
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    };
    build();
    const resize = new ResizeObserver(build);
    cards.forEach((card) => resize.observe(card));

    const pointer = { x: -1e4, y: -1e4 };
    if (matchMedia("(pointer: fine)").matches) {
        addEventListener("pointermove", (e) => Object.assign(pointer, { x: e.clientX, y: e.clientY }));
    }

    document.body.prepend(canvas);
    document.documentElement.classList.add("pixels-live");
    $(".hero-signal").classList.add("signal-live");

    // Each weight eases toward where the scroll says it should be, so the pixels glide.
    const ease = { scatter: 0, gather: 0, cap: 0, fill: [0, 0, 0, 0] };
    const toward = (now, target) => now + (target - now) * EASE;
    const frame = (t) => {
        if (stopped) return;
        try {
            const dpr = Math.min(devicePixelRatio, matchMedia("(pointer: fine)").matches ? 2 : 1.5);
            const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }
            const H = innerHeight;
            const hero = box($(".hero-signal")), contact = box($("#contact")), grid = box($(".capability-grid")), list = box($(".approach-list"));
            const [a, b] = cards.map(box);
            const tops = steps.map((li) => box(li).top);
            ease.scatter = toward(ease.scatter, clamp(-hero.top / (hero.height * 0.7)));
            ease.gather = toward(ease.gather, clamp((H * 0.95 - contact.top) / (H * 0.7)));
            ease.cap = toward(ease.cap, clamp((H * 0.95 - grid.top) / (H * 0.45)) * clamp((grid.bottom - H * 0.05) / (H * 0.35)));
            ease.fill = ease.fill.map((f, k) => toward(f, clamp((H * 0.85 - tops[k]) / (H * 0.3))));
            const [dx, dy, dsize] = dock(contact);
            const uniforms = {
                uRes: [w, h],
                uTime: [t / 1000],
                uDpr: [dpr],
                uScatter: [ease.scatter],
                uGather: [ease.gather],
                uCap: [ease.cap],
                uFill: ease.fill,
                uHero: [(hero.left + hero.width / 2) * dpr, (hero.top + hero.height / 2) * dpr, Math.min(hero.width, hero.height) * 0.54 * dpr],
                uDock: [dx * dpr, dy * dpr, dsize * dpr],
                uCardL: [a.left * dpr, a.top * dpr, a.width * dpr, a.height * dpr],
                uCardR: [b.left * dpr, b.top * dpr, b.width * dpr, b.height * dpr],
                uRows: tops.map((y) => y * dpr),
                uRowX: [list.left * dpr, list.width * dpr],
                uPointer: [pointer.x * dpr, pointer.y * dpr],
            };
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(prog);
            for (const [name, v] of Object.entries(uniforms)) gl[`uniform${v.length}f`](gl.getUniformLocation(prog, name), ...v);
            gl.drawArrays(gl.POINTS, 0, N);
        } catch {
            stop();
            return;
        }
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    start().catch(stop);
}
