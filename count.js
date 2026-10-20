// Visit counts: Cloudflare Web Analytics, cookieless, as described on /legal/. Visitors whose time zone is in the
// EU/EEA, or unknown, are asked first (EU rules want consent before a script reports on the device); everyone else is
// counted unless the browser sends Global Privacy Control or they turned counting off on /legal/. The answer stays in
// localStorage. No integrity hash on the beacon: Cloudflare updates it in place.
const BEACON = "https://static.cloudflareinsights.com/beacon.min.js";
const TOKEN = "f60cb93de13848efaf73afdcadb076cd";
const KEY = "netria-count";
// From zone.tab: EU27, Iceland, Liechtenstein, Norway and the EU's outermost regions, plus the alias Europe/Nicosia.
const EEA_ZONES = [
    "Africa/Ceuta", "America/Cayenne", "America/Guadeloupe", "America/Marigot", "America/Martinique", "Asia/Famagusta",
    "Asia/Nicosia", "Atlantic/Azores", "Atlantic/Canary", "Atlantic/Madeira", "Atlantic/Reykjavik", "Europe/Amsterdam",
    "Europe/Athens", "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels", "Europe/Bucharest", "Europe/Budapest",
    "Europe/Busingen", "Europe/Copenhagen", "Europe/Dublin", "Europe/Helsinki", "Europe/Lisbon", "Europe/Ljubljana",
    "Europe/Luxembourg", "Europe/Madrid", "Europe/Malta", "Europe/Mariehamn", "Europe/Nicosia", "Europe/Oslo",
    "Europe/Paris", "Europe/Prague", "Europe/Riga", "Europe/Rome", "Europe/Sofia", "Europe/Stockholm", "Europe/Tallinn",
    "Europe/Vaduz", "Europe/Vienna", "Europe/Vilnius", "Europe/Warsaw", "Europe/Zagreb", "Indian/Mayotte",
    "Indian/Reunion",
];

// Unknown covers UTC, which privacy-hardened browsers report, and legacy one-word names like "CET" or "Poland".
function asksFirst(zone) {
    return !zone?.includes("/") || zone.startsWith("Etc/") || EEA_ZONES.includes(zone);
}

{
    const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
    const save = (answer) => { try { localStorage.setItem(KEY, answer); } catch {} };
    const gpc = navigator.globalPrivacyControl === true;
    const asks = asksFirst(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const counting = () => !gpc && (read() === "yes" || (read() !== "no" && !asks));

    const load = () => {
        if (document.querySelector("script[data-cf-beacon]")) return;
        const beacon = document.createElement("script");
        beacon.type = "module";
        beacon.src = BEACON;
        beacon.dataset.cfBeacon = JSON.stringify({ token: TOKEN });
        document.head.append(beacon);
    };

    // The ask: two equal buttons; ignoring it counts nothing, and it comes back on the next page until answered.
    if (!gpc && asks && read() === null) {
        const ask = document.createElement("section");
        ask.className = "count-ask";
        ask.setAttribute("aria-label", "Visit counting");
        ask.innerHTML = `<p>Can we count your visits? Cloudflare (US) would get your IP address, the pages you read, the page
            that sent you here, and your browser and device type. No cookies, and we only see totals. We remember your
            answer; change it any time under <a href="/legal/#privacy">Legal &amp; privacy</a>.</p>
            <div><button class="button" type="button" value="yes">Count my visits</button>
            <button class="button" type="button" value="no">Don't count</button></div>`;
        ask.addEventListener("click", (event) => {
            const answer = event.target.closest("button")?.value;
            if (!answer) return;
            save(answer);
            ask.remove();
            if (answer === "yes") load();
        });
        document.body.append(ask);
    } else if (counting()) {
        load();
    }

    // The switch on /legal/: shows this browser's state and flips it. Without JavaScript nothing is counted anyway.
    const setting = document.querySelector("[data-count-setting]");
    if (setting) {
        const render = () => {
            setting.hidden = false;
            setting.innerHTML = gpc
                ? "Your browser sends Global Privacy Control, so this site doesn't count your visits."
                : `Visit counting is ${counting() ? "on" : "off"} in this browser.
                   <button class="button" type="button">Turn it ${counting() ? "off" : "on"}</button>`;
        };
        setting.addEventListener("click", (event) => {
            if (!event.target.closest("button")) return;
            save(counting() ? "no" : "yes");
            document.querySelector(".count-ask")?.remove();
            if (counting()) load();
            render();
        });
        render();
    }
}
