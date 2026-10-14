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


// Articles: a section's "#" link copies the section's address instead of jumping to it.
const copyLinks = document.querySelectorAll(".heading-link");

if (copyLinks.length) {
    const status = document.createElement("p");
    status.className = "copy-status";
    status.setAttribute("role", "status");
    document.body.append(status);

    copyLinks.forEach((link) => {
        link.addEventListener("click", async (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }
            event.preventDefault();
            try {
                await navigator.clipboard.writeText(location.origin + location.pathname + link.hash);
            } catch {
                // No clipboard access: put the link in the address bar instead.
                history.replaceState(null, "", link.hash);
                return;
            }
            link.dataset.copied = "";
            status.textContent = "Link copied";
            clearTimeout(link.copiedTimer);
            link.copiedTimer = setTimeout(() => {
                delete link.dataset.copied;
                status.textContent = "";
            }, 2000);
        });
    });
}
