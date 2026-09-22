# Polymath Wizard Website — Prototype

A black-and-white interactive EdTech landing site for **Polymath Wizard**.

## Included
- Full logo in large spaces; compact mark in constrained navbar/mobile space
- Three.js particle/geometry hero
- GSAP + ScrollTrigger reveal/parallax animation
- Interactive concept demonstration canvas
- Miniaturised **adaptive learning engine** (Section 03): live Bayesian Knowledge Tracing, difficulty ladder, ZPD question selection and prerequisite unlocking
- Mathematics / Chemistry / Biology / Physics division cards
- Section 06 / Mindset: interactive discipline network — a monochrome node graph (Mathematics, Chemistry, Biology, Physics), each node shaped like its subject's own symbol (π, flask, DNA helix, atom) and all four connected to one another; hover, focus or tap a node to see its name and light up its connections
- Philosophy section (05): open monochrome notebook — white page + black page, four quotes over two spreads; pages turn only by Prev/Next, arrow keys, tapping a page or swiping sideways — page scrolling never affects the book. On phones it becomes a stacked reporter's notebook.
- Contact form targeting `polymathwizardhyd@gmail.com` via the user's email client
- Responsive mobile layout
- **Scroll layer** (`scroll-fx.js`, "instrument" style): hairline rules that draw themselves, hard-edged mask reveals, hero curtain, scroll ruler with live readout, gentle Lenis smoothing, quote focus, auto-flip Textbook→Interact. Off automatically for `prefers-reduced-motion`.

## Run
Open `index.html` in a modern browser. Three.js, GSAP and Lenis are loaded from public CDNs, so an internet connection is needed for the 3D/scroll animation libraries.

## Next production steps
1. Replace placeholder division symbols with approved brand-specific marks.
2. Add the exact licensed Maragsa font file and declare it with `@font-face`.
3. Connect the form to a real email endpoint (Formspree, EmailJS, Resend, or a backend API).
4. Add optimized WebGL models/simulations for the four divisions.
5. Add accessibility audit, performance optimization, analytics and SEO/OpenGraph assets.

- Section 04: four live simulations (Mathematics, Physics, Chemistry, Biology)
