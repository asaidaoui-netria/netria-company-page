// Model explorer tabs (_includes/model-explorer.js markup, WAI-ARIA tabs pattern).
// Without this script the picker stays hidden and every panel shows in turn.
for (const root of document.querySelectorAll("[data-mx]")) {
    const tabs = [...root.querySelectorAll('[role="tab"]')];

    const select = (tab, focus) => {
        for (const t of tabs) {
            const on = t === tab;
            t.setAttribute("aria-selected", String(on));
            t.tabIndex = on ? 0 : -1;
            document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
        }
        if (focus) {
            tab.focus();
        }
    };

    root.querySelector('[role="tablist"]').addEventListener("click", (event) => {
        const tab = event.target.closest('[role="tab"]');
        if (tab) {
            select(tab);
        }
    });

    root.querySelector('[role="tablist"]').addEventListener("keydown", (event) => {
        const i = tabs.indexOf(document.activeElement);
        const moves = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
        if (i < 0 || !(event.key in moves)) {
            return;
        }
        event.preventDefault();
        select(tabs[(moves[event.key] + tabs.length) % tabs.length], true);
    });

    select(tabs.find((t) => t.getAttribute("aria-selected") === "true") ?? tabs[0]);
    root.classList.add("is-ready");
}
