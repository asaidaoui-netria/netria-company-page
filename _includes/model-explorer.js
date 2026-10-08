// Decision-model explorer: one tab per model plus a comparison table, rendered at build time
// from an article's data file. explorer.js turns it into tabs; without it every panel shows.
// The output never contains a blank line, so Markdown passes it through as one HTML block.

const esc = (value) =>
    String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const day = (iso) => new Date(`${iso}T00:00:00Z`);
const shortDate = (iso) => day(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const longDate = (iso) =>
    day(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Log scale 0–1, so a 0.3B model and a 27B model both read on the same bar.
const scale = (value, min, max) => Math.min(1, Math.max(0.04, Math.log(value / min) / Math.log(max / min)));
const SIZE = { min: 0.1, max: 30 };
const CONTEXT = { min: 256, max: 524288 };
const tokens = (n) => (n >= 1024 ? `${Math.round(n / 1024)}K` : String(n));

const logo = (m, size) =>
    `<span class="mx-logo mx-logo--${size}${m.logoBg ? ` is-${m.logoBg}` : ""}">` +
    (m.logo ? `<img src="${esc(m.logo)}" alt="${size === "lg" ? `${esc(m.maker)} logo` : ""}" loading="lazy">` : `<b aria-hidden="true">${esc(m.mono ?? m.name.slice(0, 2))}</b>`) +
    `</span>`;

const meter = (label, value, display, range) =>
    `<div class="mx-meter"><span>${label}</span>` +
    `<span class="mx-meter-track">${value ? `<span class="mx-meter-fill" style="--v: ${scale(value, range.min, range.max).toFixed(3)}"></span>` : ""}</span>` +
    `<span class="mx-meter-value${value ? "" : " is-unknown"}">${esc(display)}</span></div>`;

// Compact table labels: "Open weights + hosted API" → "Open + hosted", and no bracketed notes.
const shortAccess = (access) =>
    access.replace("Open weights + hosted API", "Open + hosted").replace("Open weights", "Open").replace("Hosted API", "Hosted");
const shortSize = (size) => (size ? size.replace(/\s*\([^)]*\)/g, "") : "—");

const chips = (label, items) =>
    `<div class="mx-chips"><span>${label}</span>${items.map((i) => `<span class="mx-chip">${esc(i)}</span>`).join("")}</div>`;

export function modelExplorer({ asOf, models }) {
    const out = [];
    out.push(
        `<p class="mx-note" role="note"><strong>Moving fast.</strong> New decision models appear almost weekly, so more may be available by the time you read this, and some details below may already be out of date. Information as of ${longDate(asOf)}, mostly from each maker’s own announcements.</p>`
    );
    out.push(`<div class="mx" data-mx>`);
    out.push(`<div class="mx-picker" role="tablist" aria-label="Decision models">`);
    models.forEach((m, i) =>
        out.push(
            `<button type="button" role="tab" class="mx-tab" id="mx-tab-${m.id}" aria-controls="mx-${m.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">` +
                `<span class="mx-tab-icon">${logo(m, "sm")}</span><span class="mx-tab-label"><span class="mx-tab-name">${esc(m.name)}</span> <span class="mx-tab-maker">${esc(m.maker)}</span></span></button>`
        )
    );
    out.push(
        `<button type="button" role="tab" class="mx-tab mx-tab--compare" id="mx-tab-compare" aria-controls="mx-compare" aria-selected="false" tabindex="-1">` +
            `<span class="mx-tab-icon"><span class="mx-logo mx-logo--sm mx-logo--compare" aria-hidden="true"><b>⇄</b></span></span><span class="mx-tab-label"><span class="mx-tab-name">Compare all</span> <span class="mx-tab-maker">${models.length} models</span></span></button>`
    );
    out.push(`<span class="mx-hint" aria-hidden="true">Select a logo to see that model.</span>`);
    out.push(`</div>`);

    for (const m of models) {
        out.push(`<section class="mx-panel" id="mx-${m.id}" role="tabpanel" aria-labelledby="mx-tab-${m.id}" tabindex="0">`);
        out.push(
            `<header class="mx-head">${logo(m, "lg")}<div class="mx-title"><h3>${esc(m.name)}</h3>` +
                `<p>${esc(m.maker)}</p></div>` +
                `<p class="mx-badges"><span class="mx-badge mx-badge--${m.weights ? "open" : "closed"}">${esc(m.access)}</span><span class="mx-badge">${esc(m.status)}</span></p></header>`
        );
        out.push(`<p class="mx-notable">${esc(m.notable)}</p>`);
        out.push(chips("Reads", m.inputs) + chips("Answers", m.outputs));
        out.push(
            meter("Size", m.sizeB, m.size ?? "Not disclosed", SIZE) +
                meter("Context", m.context, m.context ? `${tokens(m.context)} tokens` : "Not disclosed", CONTEXT)
        );
        out.push(
            `<dl class="mx-specs">` +
                [
                    ["Released", m.released && longDate(m.released)],
                    ["License", m.license],
                    ["Built on", m.base],
                    ["Speed", m.latency],
                    ["Price", m.price],
                ]
                    .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v ?? "Not disclosed")}</dd></div>`)
                    .join("") +
                `</dl>`
        );
        out.push(
            `<p class="mx-sources">Sources: ${m.sources.map((s) => `<a href="${esc(s.url)}">${esc(s.label)}</a>`).join(", ")}</p>`
        );
        out.push(`</section>`);
    }

    out.push(`<section class="mx-panel" id="mx-compare" role="tabpanel" aria-labelledby="mx-tab-compare" tabindex="0">`);
    out.push(`<h3 class="mx-compare-title">All models side by side</h3>`);
    out.push(`<div class="mx-table-wrap"><table class="mx-table">`);
    out.push(`<thead><tr><th scope="col">Model</th><th scope="col">Released</th><th scope="col">Access</th><th scope="col">Size</th><th scope="col">Context</th><th scope="col">Reads</th><th scope="col">Input price per M tokens</th></tr></thead><tbody>`);
    for (const m of models) {
        out.push(
            `<tr><th scope="row"><span class="mx-row-name">${logo(m, "xs")}<span>${esc(m.name)}<small>${esc(m.maker)}</small></span></span></th>` +
                `<td>${m.released ? shortDate(m.released) : "—"}</td><td>${esc(shortAccess(m.access))}</td><td>${esc(shortSize(m.size))}</td>` +
                `<td>${m.context ? tokens(m.context) : "—"}</td><td>${esc(m.inputs.join(", "))}</td><td>${esc(m.priceIn ?? "—")}</td></tr>`
        );
    }
    out.push(`</tbody></table></div>`);
    out.push(`<p class="mx-sources">“—” means the maker has not published it. Sizes and prices change often; check each maker’s page before relying on them.</p>`);
    out.push(`</section>`);
    out.push(`<script src="/explorer.js" defer></script>`);
    out.push(`</div><!--/mx-->`);
    return out.join("\n");
}
