# Build status — 7 Nov 2026

## Done
- Reference studied in the browser and from its page source (`docs/reference-audit.md`).
- Hero: Onest, measured tokens, both themes (dark by default until the cord is pulled), live Pune clock, 3D flip notebook, b/w portrait with colour painted along the cursor trail + a colour toggle for touch/keyboard, ability-card tag, status hairline.
- Pull cord: canvas verlet rope, drag past travel toggles once per gesture, click/Enter/Space tug, `role="switch"`, persists, no flash (inline pre-paint script), sleeps when still.
- Doors: five arched doors on one wall; spring leaf; walk-in zoom and walk-out (back out of the doorway, door swings shut) matched to the reference's timings.
- Smoothness pass: no canvas blur in the cord, no blend-mode or backdrop blur layers while scrolling, story work paused off screen, Lenis lerp .085, parallax on cached offsets. `scripts/motion.mjs` frame check: scroll and walk-in p95 ≈ 7 ms (headless Edge).
- Rooms `/work/{ai-agents,products-web,ml-impact}`: stacked sticky panels with real screenshots in monitor/phone/terminal frames, search, coursework archive.
- 19 case studies `/projects/*` with problem / approach / decisions / features / stack / contribution / limits / evidence and a screenshot lightbox.
- Tamrivo info room (no code, links or internals, per owner).
- Certificates: 28 documents ingested by `scripts/certificates.py`; five pegged "worlds" (clothesline with swinging prints and stacks), full-size viewer with View original / Verify.
- Story timeline with rolling year, dial backdrop, travelling dot, tinted ambient light.
- Ability card (tilt, drag, F/double-click/Flip, Escape/Close, embers only while open).
- Contact: four-step enquiry ending in an email draft (no fake "sent").
- Lenis smooth scrolling on fine pointers; native on touch.
- SEO: metadata, OG image, favicon, sitemap, robots, Person schema linking GitHub and LinkedIn.
- GitHub and LinkedIn buttons in the header on every page (and in the menu, footer and card).

## Verification
- `tsc`, `eslint`, `next build` clean (31 static routes).
- Playwright `tests/site.spec.ts`: 26 passed, 2 skipped (desktop-only pointer checks) at 1440×900 and 390×844.
- Perf (`scripts/perf.mjs`, local production build): mobile 4× CPU / 1.6 Mbps → LCP 1.26 s, CLS 0.04; desktop LCP 0.11 s, CLS 0.002. Not a field measurement.
- Visual review: `scripts/shots.mjs` (desktop dark/light + phone).

## Open
- Confirm B.Tech start month.
