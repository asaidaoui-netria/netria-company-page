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

const revealItems = [...document.querySelectorAll("[data-reveal]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.14,
            rootMargin: "0px 0px -48px",
        }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
}
