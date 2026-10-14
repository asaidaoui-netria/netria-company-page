document.documentElement.classList.replace("no-js", "js");

const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const menuLinks = navMenu ? [...navMenu.querySelectorAll("a")] : [];

function setMenuOpen(open) {
    if (!navToggle || !navMenu) {
        return;
    }

    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    navMenu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
}

if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        setMenuOpen(!isOpen);
    });

    menuLinks.forEach((link) => {
        link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuOpen(false);
            navToggle.focus();
        }
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";

        if (
            isOpen &&
            target instanceof Node &&
            !navMenu.contains(target) &&
            !navToggle.contains(target)
        ) {
            setMenuOpen(false);
        }
    });

    const desktopQuery = window.matchMedia("(min-width: 901px)");
    desktopQuery.addEventListener("change", (event) => {
        if (event.matches) {
            setMenuOpen(false);
        }
    });
}


// Copy without leaving the page: an article section's "#" link copies its address, and a
// [data-copy] button copies the text of the element it names (the contact email).
const copyTargets = document.querySelectorAll(".heading-link, [data-copy]");

if (copyTargets.length) {
    const status = document.createElement("p");
    status.className = "copy-status";
    status.setAttribute("role", "status");
    document.body.append(status);

    // Empty, then refill on the next frame, so screen readers announce a repeat copy again.
    const say = (message) => {
        status.textContent = "";
        requestAnimationFrame(() => {
            status.textContent = message;
        });
    };

    copyTargets.forEach((el) => {
        el.addEventListener("click", async (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }
            event.preventDefault();
            const target = el.dataset.copy && document.getElementById(el.dataset.copy);
            const text = target ? target.textContent : location.origin + location.pathname + el.hash;
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                // No clipboard access: select the address so the keyboard can copy it, or put
                // the section's link in the address bar.
                if (target) {
                    getSelection().selectAllChildren(target);
                    say("Address selected, ready to copy");
                } else {
                    history.replaceState(null, "", el.hash);
                }
                return;
            }
            el.dataset.copied = "";
            say(target ? "Address copied" : "Link copied");
            clearTimeout(el.copiedTimer);
            el.copiedTimer = setTimeout(() => {
                delete el.dataset.copied;
                status.textContent = "";
            }, 2000);
        });
    });
}
