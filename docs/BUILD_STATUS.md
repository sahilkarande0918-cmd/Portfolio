# Build status — 7 Nov 2026

## Done
- Reference studied in the browser and from its page source (`docs/reference-audit.md`).
- Hero: Onest, measured tokens, both themes (dark by default until the cord is pulled), live Pune clock, 3D flip notebook, b/w portrait with colour painted along the cursor trail + a colour toggle for touch/keyboard, ability-card tag, status hairline.
- Pull cord: canvas verlet rope, drag past travel toggles once per gesture, click/Enter/Space tug, `role="switch"`, persists, no flash (inline pre-paint script), sleeps when still.
- Doors: four arched doors + the Certificates door along the wall (arrow / keyboard / links); hover cracks the door and describes the room; click swings it into the room and zooms through; back restores the door focus.
- Rooms `/work/{ai-agents,products-web,ml-impact}`: stacked sticky panels with real screenshots in monitor/phone/terminal frames, search, coursework archive.
- 19 case studies `/projects/*` with problem / approach / decisions / features / stack / contribution / limits / evidence and a screenshot lightbox.
- Tamrivo info room (no code, links or internals, per owner).
- Certificates: 28 documents ingested by `scripts/certificates.py`; five pegged "worlds" (clothesline with swinging prints and stacks), full-size viewer with View original / Verify.
- Story timeline with rolling year, dial backdrop, travelling dot, tinted ambient light.
- Ability card (tilt, drag, F/double-click/Flip, Escape/Close, embers only while open).
- Contact: four-step enquiry ending in an email draft (no fake "sent").
- Lenis smooth scrolling on fine pointers; native on touch.
- SEO: metadata, OG image, favicon, sitemap, robots.

## Verification
- `tsc`, `eslint`, `next build` clean (31 static routes).
- Playwright `tests/site.spec.ts`: 26 passed, 2 skipped (desktop-only pointer checks) at 1440×900 and 390×844.
- Perf (`scripts/perf.mjs`, local production build): mobile 4× CPU / 1.6 Mbps → LCP 1.26 s, CLS 0.04; desktop LCP 0.11 s, CLS 0.002. Not a field measurement.
- Visual review: `scripts/shots.mjs` (desktop dark/light + phone).

## Open
- Drishti 2.0 and Veris app screenshots wanted.
- Confirm Hack4Humanity prize project, B.Tech start month, and that the contact email may be public.
