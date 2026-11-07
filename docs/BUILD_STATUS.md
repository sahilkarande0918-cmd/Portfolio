# Build status — 7 Nov 2026

## Done
- Reference studied in the browser and from its page source (`docs/reference-audit.md`).
- Hero: Onest, measured tokens, both themes (dark by default until the cord is pulled), live Pune clock, 3D flip notebook, b/w portrait with colour painted along the cursor trail + a colour toggle for touch/keyboard, ability-card tag, status hairline.
- Pull cord: canvas verlet rope, drag past travel toggles once per gesture, click/Enter/Space tug, `role="switch"`, persists, no flash (inline pre-paint script), sleeps when still.
- Doors: five arched doors on one wall; spring leaf; walk-in zoom and walk-out (back out of the doorway, door swings shut) matched to the reference's timings.
- Smoothness pass: no canvas blur in the cord, no blend-mode or backdrop blur layers while scrolling, story work paused off screen, Lenis lerp .085, parallax on cached offsets. Measured with `scripts/present.mjs` (below).
- Door camera moves use Motion's frame-synced `animate()`; the back-out first paints the wall at 1x under the cover (so zoomed frames reuse that raster) and waits for the freshly mounted page to go idle. A compositor (WAAPI) camera was tried and rejected: Chrome re-rasterises the wall at peak zoom, stalling ~1 s.
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

## Performance (7 Nov 2026)
- Lite profile (set before first paint for touch devices, <=4 cores, <=4 GB or data saver): native scrolling, no parallax, no ambient drift/dial canvas, no idle certificate sway, fewer embers, lower canvas density. Same layout and features.
- Found with Chrome traces (`scripts/trace.mjs`): the header's height was written to a root CSS variable on every frame of its shrink, restyling the whole page; the timeline and back-to-top forced layouts each scroll frame; status dots animated box-shadow (repaint every frame). All fixed: `--nav-h` is pure CSS, per-frame code only writes transforms from cached positions, pulses are composited rings, plaster is a pre-rendered tile, the sill glow has no filter.
- `scripts/firstpaint.mjs` (first scroll into the doors): phone at 6x CPU 0–5 dropped frames (was 34–41); 4-core laptop at 6x 2–13 (was 56–65); this laptop at 4x 0–5.
- Door exit (fixed 7 Nov 2026, verified on the GPU with `scripts/present.mjs`, which counts frames actually presented by a real headed Edge window): the back-out is the walk-in reversed from 3.2x (above that the screen is only the dark gap). Causes found in traces and fixed: a fully opaque cover made Chrome skip drawing the wall underneath (now 99%); jumping straight to 14x made Chrome redraw the wall at 14x and evict tiles over its GPU memory budget ("tile violates memory policy") (now a quick 1x→3.2x ramp under the cover); the rest of the freshly loaded page got its first GPU raster mid-move (now held until the camera stops); rooms pre-warm the home page and texture. Result: worst presented frame 7–23 ms (first-time and returning visitors), 11–26 ms at 4x CPU, none over 50 ms; was 50–154 ms on the live site. Dark pause 1.0 s (was 1.5 s).

## Verification
- `tsc`, `eslint`, `next build` clean (31 static routes).
- Playwright `tests/site.spec.ts`: 30 passed, 2 skipped (desktop-only pointer checks) at 1440×900 and 390×844.
- Perf (`scripts/perf.mjs`, local production build): mobile 4× CPU / 1.6 Mbps → LCP 1.26 s, CLS 0.04; desktop LCP 0.11 s, CLS 0.002. Not a field measurement.
- Visual review: `scripts/shots.mjs` (desktop dark/light + phone).

## Open
- Confirm B.Tech start month.
