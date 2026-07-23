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
- restrained grids, particles, and orbital geometry;
- geometric display typography with technical monospace labels;
- conventional scrolling and reduced-motion support.

## Contact

Visitors contact Netria directly at [hello@netria.dev](mailto:hello@netria.dev).

## Project Structure

```text
.
├── assets/                  # Logos, favicons, and social artwork
├── docs/superpowers/        # Approved design and implementation plan
├── tests/                   # Dependency-free Node contract tests
├── CNAME                    # Custom-domain configuration
├── index.html               # Semantic page content and metadata
├── script.js                # Mobile navigation and progressive reveals
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
git diff --check
```

The page should also be checked at 320px, 768px, 1024px, and 1440px widths, with keyboard navigation and reduced motion enabled.

## Deployment

The repository is deployed as a static site. `CNAME` preserves the custom `netria.dev` domain.
