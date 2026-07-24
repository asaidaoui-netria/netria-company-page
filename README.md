# Netria Company Page

Custom software and workflow automation, presented through a lightweight static homepage for Netria.

## Positioning

Netria helps teams turn product ideas and operational friction into dependable software. The homepage presents two equal capability paths:

- build a custom digital product;
- improve an operation through automation and connected systems.

The authored content is English-only and uses semantic HTML so browser-native translation remains available.

## Design

The **Quiet Signal** identity combines:

- a near-black canvas;
- signal-green highlights;
- the Netria pixel moth;
- self-hosted Fusion Pixel bitmap typography with technical monospace labels;
- CRT scanlines, dithered textures, pixel-cut corners, and hard offset shadows;
- a no-scrollbar scene pager with a directional glyph-wave transition (careers.kimi.com parity), plus heading-decode and pixel-dissolve entrances on every scene entry;
- restrained grids, particles, and squared orbital geometry;
- hash deep-linking, wheel/touch/keyboard navigation, and reduced-motion instant cuts (no-JS keeps the normal scrolling document).

## Contact

Visitors contact Netria directly at [hello@netria.dev](mailto:hello@netria.dev).

## Project Structure

```text
.
├── assets/                  # Logos, favicons, fonts, and social artwork
├── docs/superpowers/        # Approved design and implementation plan
├── tests/                   # Dependency-free Node contract tests
├── CNAME                    # Custom-domain configuration
├── index.html               # Semantic page content and metadata
├── script.js                # Mobile navigation and progressive reveals
├── scenes.js                # Scene pager, glyph wave, entrances
└── styles.css               # Quiet Signal visual system
```

## Local Development

From the project root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Validation

Run all contract tests:

```bash
node --test tests/*.test.mjs
```

Check JavaScript syntax and whitespace:

```bash
node --check script.js
node --check scenes.js
git diff --check
```

The page should also be checked at 320px, 768px, 1024px, and 1440px widths, with keyboard navigation and reduced motion enabled.

## Deployment

The repository is deployed as a static site. `CNAME` preserves the custom `netria.dev` domain.
