# Build status — checkpoint 8 Nov 2026

Resume here after a context reset. Read this file, then `docs/reference-audit.md`, `docs/content-audit.md`, `docs/asset-manifest.md`, and the master prompt `C:\Users\Sahil\Downloads\Sahil_Portfolio_Claude_Code_Prompt.md` (original requirements; the owner's later instructions below supersede it).

## State
- Repo `sahilkarande0918-cmd/Portfolio`, local `D:\Portfolio`, branch `main`, in sync with `origin/main`.
- Latest implementation commit: `86f575b` (door exit fix). `a646049` (walk-in tweak) was reverted by `6aa38a0`; the code at `6aa38a0` equals `86f575b` plus the scripts.
- Live: https://thesahilkarande.vercel.app (Vercel, auto-deploys on push to `main`).
- Git identity: `sahilkarande0918-cmd <sahilkarande0918@gmail.com>`. No Claude/AI author, co-author or "generated with" lines, in commits or PRs. `.claude/settings.json` has an `attribution` block that turns this off.
- Current task: none in progress. The last request ("coming out of the door is laggy") is fixed and was verified on the live site.

## Standing rules (owner's instructions)
- Ponytail (full) is mandatory for all implementation and review. It is a code discipline only; it never simplifies away the notebook, doors, cord, card or portrait.
- Clone the reference https://therishithakor.com (home, my-story, rooms) as closely as possible, using Sahil's own content. Don't redesign completed work.
- **Tamrivo:** info only ("I'm building this startup"). Don't edit or touch that project or its repo. No code, links or internals.
- **SahvoraOS:** keep the project; never link a Vercel app for it (it has none, it's for personal use).
- **KisaanRaksha:** won the Hack4Humanity 2026 3rd prize. The contact email may be public.
- **Drishti 2.0:** app icon only. **Veris:** owner-supplied Android screenshots.
- **Certificates:** clothesline / pegged "worlds" with stacks, in short sections, not a long scroll.
- **Theme:** dark by default until the cord is pulled.
- **Doors:** all five doors in one line. Walk in and out should be smooth and match the reference.
- **Scrolling:** smooth Lenis scrolling and parallax on capable devices. No lag on low-end phones or laptops.
- **Header:** GitHub and LinkedIn links on every page.
- **Portrait:** normal cursor, no drag ghost, plus sign, selection or long-press menu. Wider colour brush, slightly larger on hover.
- **Never publish:** student IDs, PRNs, private internals, credentials. Don't fabricate claims. Don't read `.env`. Keep Portfolio separate from other projects.
- **Domain:** free only. Vercel subdomain plus is-a.dev; no paid domain.

## Done
- **Hero:** Onest, both themes, live Pune clock, 3D flip notebook, b/w portrait painted to colour along the cursor (with a toggle for touch), ability-card tag.
- **Pull cord:** verlet rope canvas, `role="switch"`, choice persisted, no theme flash.
- **Doors** (`components/Doors.tsx`, `components/walk.ts`): five arched doors, spring leaf, walk-in zoom, walk-out back-out.
- **Rooms** (`/work/{ai-agents,products-web,ml-impact}`): stacked sticky panels, real screenshots, search, coursework archive. 19 case studies under `/projects/*`.
- **Tamrivo** info room (`/tamrivo`).
- **Certificates** (`/certificates`): 28 PDFs processed by `scripts/certificates.py`. Five clothesline worlds with stacks and a full-size viewer. The Cisco internship student ID is masked.
- **Story timeline**, **ability card**, and a **contact** flow that ends in an email draft (no fake "sent").
- **SEO:** metadata, OG image, sitemap, robots, Person schema.
- **Performance:**
  - Lite profile (touch, ≤4 cores, ≤4 GB or data saver): native scroll, no parallax or ambient canvases.
  - `--nav-h` is pure CSS; per-frame code only writes transforms.
- **Door exit fix** (`86f575b`):
  - The cover is 99% opaque, so Chrome still draws the wall underneath.
  - The back-out starts at 3.2× after a 0.16 s ramp under the cover, not a jump to 14×, which made Chrome evict tiles.
  - The rest of the home page is hidden until the camera stops (`[data-exit]` rule in `app/globals.css`).
  - Rooms pre-warm `/` and `plaster.webp` while idle.
  - Constants in `Doors.tsx`: `ZOOM_MS 1500`, `BACK_MS 1300`, `EXIT_ZOOM 3.2`, ease `[0.65,0,0.35,1]`.

- **8 Nov 2026:**
  - Added the DY Patil "Kurukshetra" hackathon certificate (29 certificates now), in the Prizes & Internships world.
  - Fixed a one-time hitch on the first desktop scroll into the doors. The browser's first drawing of the door wall compiles GPU shaders: ~90 ms frames in a cold browser.
  - `Doors.tsx` now, once the page is idle, draws a 1%-opacity copy of the wall for three frames, so that work happens before the scroll.
  - Measured in a cold headed Edge on a local production build: worst frame 80–104 ms before, 14–16 ms after, none over 25 ms.
  - The warm-up only runs when the door row starts below the first screen, so the check measures the row, not the section; the section itself starts 32 px into the viewport.
  - Certificates page: the intro's parallax drift slid it over the world tabs. The drift is removed from that header only.
  - is-a.dev PR #60323, checked 8 Nov: still open, review required, not merged; no DNS record yet.

## Checks actually run (8 Nov 2026, at `6aa38a0`)
- `npx tsc --noEmit`: exit 0.
- `npx eslint .`: exit 0.
- `npx playwright test` against the live site (`BASE_URL=https://thesahilkarande.vercel.app`, msedge): 30 passed, 2 skipped (desktop-only pointer checks), at 1440×900 and 390×844.
- `scripts/present.mjs` against the live site measured frames the GPU presented in headed Edge. Headless numbers are misleading because it composites in software. Worst frame:

  | Run | Walk out | Walk in |
  |---|---|---|
  | First-time visitors | 7.5–39 ms, none over 50 ms | ~59–73 ms gap at the handoff, under the cover |
  | 4× CPU | 7.7–8.6 ms | not measured |
  | Lite, 4-core / 4 GB | 13–25 ms | not measured |

  Before the fix, walking out measured 50–154 ms on the live site.
- Not run this checkpoint: a local `next build`. It hung at the end in the last session (cause unknown); Vercel's remote builds succeed.

## Known issues / open
- Walk-in has a ~60 ms gap at the room handoff, hidden under the cover. Low-end walk-in varies, with occasional 70–145 ms frames. An attempt to fix it (`a646049`) was reverted because it measured worse.
- The local `next build` hang has not been investigated.
- The B.Tech start month is unconfirmed (shown as "2025 — Now").
- Optional assets: Drishti screenshots (if wanted instead of the icon) and a résumé PDF.
- **is-a.dev:** the owner submitted PR #60323 for `thesahilkarande.is-a.dev`. Last known: all checks green, awaiting maintainer review. The domain is already added in Vercel. Next: once it merges, confirm https://thesahilkarande.is-a.dev serves the site. is-a.dev forbids AI-made PRs; the owner handles that PR.

## Next steps
1. Nothing is pending from the owner. Wait for new instructions.
2. When is-a.dev PR #60323 merges, verify the domain and HTTPS in Vercel.
3. If asked to improve walk-in smoothness, measure first with `scripts/present.mjs` (FRESH=1, CPU=4, LOWEND=1) and change one thing at a time.

## Tools and files
- **Stack:** Next.js 16.4.5 App Router, React 19.3.1, TypeScript, plain CSS (`app/globals.css`, `app/pages.css`), Lenis 1.3.27, Motion 14.10.1, Playwright 1.65 (msedge).
- **Key components:** `Doors.tsx`, `walk.ts`, `Header.tsx` (room leave, pre-warm, social chips), `SmoothScroll.tsx`, `Story.tsx`, `Portrait.tsx`, `CertificateGallery.tsx`, `Footer.tsx`.
- **Content:** `content/*.ts` (site, projects, certificates).
- **Scripts:**
  - `present.mjs`: GPU frame measurement, headed Edge parked off-screen.
  - `trace.mjs`, `firstpaint.mjs`, `perf.mjs`: profiling.
  - `shots.mjs`: screenshots.
  - `capture.mjs`: project screenshots.
  - `certificates.py`: builds the certificate assets.
- **Assets:** `public/portrait/{bw,color}.webp`, `public/media/*`, `public/certificates/{thumbs,full,files}/`, `public/textures/plaster.webp`. Certificate sources are in `C:\Users\Sahil\OneDrive\Desktop\Certificates` (also `D:\Certificates`).
- **Skills:** `ponytail:ponytail` (full) and `ponytail:ponytail-review`. `design-taste-frontend` was available for design passes.
