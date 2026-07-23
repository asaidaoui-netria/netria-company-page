# Netria Homepage Refresh Design

Date: 2026-07-23
Status: Approved for implementation planning

## Summary

Refresh the Netria homepage as an English-only, internationally relevant company page for custom software development and workflow automation.

The redesign will use a premium cyberpunk-inspired identity named **Quiet Signal**: a near-black canvas, vivid green highlights, restrained pixel geometry, and atmospheric motion. It will draw inspiration from the pixel precision and immersive darkness of the Kimi Careers website without copying its lunar imagery, scene navigation, or animation complexity.

The page will use a **Dual Track** content structure. Custom digital products and workflow automation will receive equal prominence. Because Netria does not yet have client work, testimonials, or delivery metrics to present, credibility will come from a specific offer, recognizable use cases, a transparent engagement process, and clear working principles.

## Goals

- Present Netria as an internationally relevant software partner without explicitly announcing a geographic expansion.
- Explain custom software development and workflow automation with equal clarity.
- Speak to founders, established businesses, and product or technology teams through shared needs rather than company size.
- Replace the contact form with a direct email action.
- Establish a distinctive black, green, pixel-led brand identity.
- Preserve the current lightweight static deployment model and strong performance.
- Keep the English page compatible with browser-native translation.
- Remove page analytics and visitor-data collection.

## Non-Goals

- Adding a portfolio, case studies, testimonials, client logos, or performance metrics before supporting evidence exists.
- Adding a CMS, application framework, backend, database, or contact-form provider.
- Retaining a custom language selector or maintaining French and Arabic translations.
- Reproducing Kimi Careers' full-screen scene navigation, lunar imagery, scroll hijacking, or animation system.
- Adding speculative service areas that Netria does not intend to offer.

## Audience and Positioning

The homepage will not select a single company-size segment. It will focus on a shared need:

> Teams with complex ideas or operational friction that need dependable software built around how they work.

This accommodates:

- founders launching a new digital product;
- established businesses replacing manual or fragmented operations;
- product and technology teams extending their delivery capacity.

The positioning will remain geography-neutral. English will be the only authored language. Semantic HTML and complete text nodes will allow popular browsers to offer automatic translation without a site-owned localization system.

## Calls to Action

The primary conversion is a direct email to `hello@netria.dev`.

- The hero action will read **Start a conversation**.
- The closing action will repeat the invitation with the visible email address.
- Both actions will use a `mailto:` link.
- The address will remain visible and selectable so visitors can copy it when no desktop email client is configured.
- A secondary hero action will scroll to the capabilities section.

There will be no form, Formspree dependency, submission state, validation, or notification modal.

## Page Architecture: Dual Track

### 1. Navigation

The fixed or sticky navigation will contain:

- Netria pixel-moth mark and wordmark;
- Capabilities;
- Approach;
- Principles;
- a visually emphasized email action.

Mobile navigation will use a conventional accessible menu. It will not adopt experimental scene navigation.

### 2. Hero

The hero establishes the shared outcome across both service paths.

- Eyebrow: **Custom software · Workflow automation**
- Headline: **Software for ideas and operations in motion.**
- Supporting copy: **We design and build dependable digital products and automated systems that turn complex work into forward motion.**
- Primary action: **Start a conversation**
- Secondary action: **Explore capabilities**

The pixel moth will be the central visual motif. It may appear inside a sparse signal field or orbital grid, but the visual must remain abstract and specific to Netria rather than borrowing Kimi's moon.

### 3. Two Ways We Help

Two equally weighted capability panels will appear immediately after the hero.

#### Build a Product

Turn a product idea into dependable software. Representative outputs include:

- web applications;
- mobile experiences;
- digital platforms;
- internal tools.

Copy will describe a path from concept and product framing through implementation and release without implying an unsupported project history.

#### Improve a System

Remove operational friction with better-connected software. Representative outputs include:

- workflow automation;
- system integrations;
- operational tools;
- clearer data flows and dashboards.

Copy will emphasize reducing manual work and connecting fragmented tools.

### 4. Situations We Support

Audience fit will be expressed through recognizable situations:

- launching a new digital product;
- replacing spreadsheets or repetitive manual work;
- connecting fragmented business tools;
- extending an existing product or engineering team.

This section will not create separate startup, enterprise, or product-team funnels.

### 5. How Engagements Work

The approach will use four concise stages:

1. **Frame the problem** — clarify the outcome, constraints, users, and highest-risk assumptions.
2. **Prototype the path** — test the experience and technical direction before investing in the full build.
3. **Build and validate** — deliver in understandable increments and validate against the intended workflow.
4. **Release and evolve** — put the system into use, learn from it, and improve deliberately.

This section establishes credibility through process rather than unverifiable outcomes.

### 6. Working Principles

The principles section will communicate:

- clarity before complexity;
- pragmatic engineering;
- close collaboration;
- software designed to evolve.

The copy should be confident but modest. It must avoid superlatives, invented proof, and generic claims such as "industry-leading."

### 7. Closing Contact and Footer

The closing section will invite visitors to email Netria about a product idea or operational problem.

The footer will include:

- Netria brand;
- essential section links;
- `hello@netria.dev`;
- the current copyright year.

It will not include a physical location, language selector, or Morocco-specific tagline.

## Visual System: Quiet Signal

### Color

The design will use:

- near-black page background around `#050706`;
- slightly lighter charcoal surfaces for hierarchy;
- off-white primary text;
- subdued gray-green secondary text;
- vivid signal green around `#63FF72`.

Signal green will be reserved for actions, focus states, active markers, section indices, and restrained atmospheric light. Large areas of bright green should be avoided.

### Typography

- Headlines will use a confident geometric display sans-serif.
- Navigation, labels, metadata, and section numbering will use JetBrains Mono or an equivalent technical monospace.
- Body text will prioritize readability over the terminal metaphor.
- Arabic-specific Cairo font loading will be removed.

The implementation may use one display family and JetBrains Mono through a single optimized font request, with robust system fallbacks.

### Pixel Language

The existing pixel moth is the primary brand anchor. Supporting pixel details may include:

- crisp stepped edges;
- sparse square particles;
- low-contrast grid lines;
- selective dithering;
- section numbering;
- small signal or status motifs.

Pixel effects must not reduce text readability or make the company appear to be a game studio.

### Layout and Components

- Use generous dark negative space and asymmetric compositions.
- Use thin green-tinted borders and low-radius panels.
- Avoid the current white cards, soft corporate shadows, emoji service icons, and large rounded rectangles.
- Give each section a clear index or signal marker.
- Maintain a readable content width and conventional vertical scrolling.

### Motion

Permitted motion includes:

- restrained initial text reveals;
- a short pixel activation around the moth;
- slow decorative grid drift;
- subtle hover signals;
- progressive section reveals.

Motion will not control navigation or block access to content. Under `prefers-reduced-motion`, decorative animation will stop and content will appear without delayed reveals.

### Responsive Behavior

- Capability panels and audience situations will stack on narrow screens.
- Decorative density and glow effects will reduce on mobile.
- Touch targets will meet comfortable mobile sizing.
- The primary email action will remain visible without dominating the viewport.
- The navigation will collapse into a conventional menu with correct focus management and expanded state.

## Technical Design

### Architecture

The implementation will remain a static site:

- `index.html` for semantic content and metadata;
- `styles.css` for tokens, layout, components, responsive rules, and motion;
- `script.js` for mobile navigation and optional progressive decoration.

No framework or build step is required.

### Existing-Code Cleanup

Implementation will:

- remove the duplicated navigation markup in `index.html`;
- remove the contact form and Formspree endpoint;
- remove form validation and notification code;
- remove the language drawer and all localization controls;
- remove `i18n.js` and its script reference;
- remove the Plausible analytics script;
- remove dynamic CSS injection from `script.js`;
- consolidate responsive navigation styling in `styles.css`;
- update documentation that describes Morocco-specific positioning, localization, and the contact form.

### Data Flow and External Services

There is no application data flow.

- Email contact leaves the page through a `mailto:` URL.
- Google Fonts may remain as a presentation dependency, subject to final performance checks.
- No form data or visitor message content will be sent to Netria infrastructure or a third-party form processor.
- No analytics script or visitor-tracking service will be included.

### Error and Fallback Behavior

- If a visitor has no email client configured, the visible email address remains selectable and copyable.
- Content remains usable when JavaScript is unavailable.
- Decorative effects fail silently and never replace essential text.
- Font fallbacks preserve hierarchy when remote fonts fail.
- Navigation anchors remain normal links and work without smooth-scrolling JavaScript.

## International and Translation Behavior

- Set the document language to English.
- Remove French and Arabic translation dictionaries and language-selection UI.
- Keep copy in semantic text nodes rather than canvas, generated images, or pseudo-elements.
- Do not mark normal content as non-translatable.
- Brand name and email address remain understandable if browser translation changes adjacent content.
- Remove Morocco, Moroccan, Maroc, المغرب, Kenitra, and Kénitra references from user-facing content, metadata, and documentation where they describe the site's current positioning.

## SEO and Social Metadata

Update the page to use geography-neutral metadata.

- Proposed title: **Netria — Custom Software & Workflow Automation**
- Proposed description: **Netria designs and builds custom digital products and automated systems that turn complex work into forward motion.**
- Update Open Graph and social titles and descriptions to match.
- Refresh the Open Graph image with a near-black background, the green pixel moth, and concise English positioning.
- Update the theme color to the near-black page color or signal green based on browser chrome testing.
- Preserve the canonical `https://netria.dev/`.
- Use semantic headings and descriptive link text.

## Accessibility

Implementation must provide:

- sufficient contrast for text, borders, and interactive states;
- a visible signal-green keyboard focus treatment;
- correct heading hierarchy and landmark elements;
- an accessible mobile-menu button with accurate expanded state;
- keyboard access to all links and controls;
- no essential information conveyed only through color;
- reduced-motion behavior;
- decorative graphics hidden from assistive technology;
- sensible alternative text for the Netria mark;
- no autoplaying sound or flashing effects.

## Performance

- Reuse optimized logo assets where they remain visually crisp.
- Avoid a heavy animation library.
- Prefer CSS decoration or a small progressive canvas effect over large background media.
- Limit font families and requested weights.
- Remove unused localization and form code.
- Keep the initial page meaningful before fonts and JavaScript load.

## Validation

Implementation verification will cover:

- semantic structure and heading order;
- navigation and section-anchor behavior;
- direct email links and visible copy fallback;
- mobile-menu keyboard and pointer behavior;
- responsive layouts at representative mobile, tablet, and desktop widths;
- no horizontal overflow;
- reduced-motion behavior;
- color contrast and visible focus;
- missing assets and browser console errors;
- absence of Morocco-specific positioning in authored page content and metadata;
- absence of French and Arabic localization UI and code;
- removal of Formspree and contact-form behavior;
- removal of Plausible and all analytics scripts;
- Open Graph and standard metadata;
- basic performance and accessibility checks;
- graceful use of the page without JavaScript.

## Approved Direction

The approved design combines:

- **Quiet Signal** visual identity;
- **Dual Track** page architecture;
- direct email conversion;
- English-only authored content with browser-native translation compatibility;
- equal emphasis on custom software products and workflow automation;
- capability- and process-based credibility until real project evidence becomes available.
