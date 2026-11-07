# Reference audit — therishithakor.com

Inspected 7 Nov 2026 in the in-app browser at 1440×900 (and 800×600), plus the page source of `/home`, `/web-developer/` and `/graphic-designer/`. Read for measurement only; no code, artwork, portrait or copy was reused.

## Observations (measured)

| Area | Measurement |
|---|---|
| Font | Onest variable (100–900), self-hosted latin + latin-ext; monospace labels use `ui-monospace, SF Mono, Menlo, Consolas` |
| Type scale | Root font-size scales with the viewport: `.8333vw` ≤1920, `1.1111vw` ≤1440, `1.5625vw` ≤1024, `4.4444vw` ≤640 (16px at each breakpoint's width). H1 `4.75rem / 600 / .98 / -.02em` desktop, 2.625 → 3.5 → 4.25rem below |
| Colours (light) | bg `#E8E4E0`, fg `#1A1818`, muted `#857878`, line `#D5CDCA`, accent `#6B5C5C`, hero radial `#EEEAE6 → #E8E4E0 → #D8CDCA` |
| Colours (dark) | bg `#1A1818`, fg `#E8E4E0`, hero radial `#2A2525 → #1F1C1C → #141212`, page edge `#0F0E0E` |
| Layout | shell max 88rem, side gutter 5.5rem ≥1024px; status bar 3.5rem with 1px hairline; hero bottom radius 2rem with drop shadow onto the wall |
| Header | fixed; nav gap 1.4rem at ≥1200px; clock chip radius .875rem, 1px `rgba(196,176,176,.45)` border, blur(4px); menu button below 1200px |
| Pills | dark pill `.875rem 1.75rem`, arrow variant with 2.25rem round badge |
| Notebook | `cal` is a 3D desk flip-calendar: page width follows the word, rings every ~.62em, stacked-edge box-shadows, stand behind, page lifts around the top binding and drops behind; ~2.6s hold |
| Cord | canvas verlet rope (fixed step, constraint passes), walnut pull with brass ferrule, cast shadow; `role="switch"` labelled "Dark mode (pull the cord)"; sleeps when still; drops in after intro |
| Doors | arch `aspect-ratio 1/2.25`, width `min(17.5rem, (100svh − 19.5rem)/2.25)`; casing with plinths and bead; reeded leaf; brass plate at 31%; lever + keyhole at 59%; light under sill; baseboard strip; 4 visible + 1 off the wall reached by sliding the row; hover fades others to ~.03 and shows a description beside the door; "Click to enter" cursor badge |
| Door choreography | lever presses, leaf swings into the room on its left hinge, then the whole wall scales around the dark gap until the room fills the screen; the room page fades in from a warm glow (~.8s) |
| Room pages | "Back to the doors" pill (bottom-left when wide), H1 `clamp(34px, 8.2vw, 104px)`, stacked sticky project cards (radius 28px, padding 48/52, 5fr/7fr grid alternating), side-on monitor mock `rotateY(-17deg)` |
| Graphic room | "worlds": each campaign is a sticky panel in its own colours; scroll walks a translated track along a wire; prints hang from wooden pegs and swing (spring on scroll velocity + idle sway); carousels hang as stacks; progress bar + "Scroll →" |
| Ability card | full-screen dark radial room; 1040×1452 card; tilt toward pointer, drag to turn, tap/F to flip; foil (colour-dodge gradient), gilt sheen, glare and portrait parallax all moved by transform only; back is a dark card with a gold compass |
| Story | year in 4 rolling digit columns (`.9s cubic-bezier(.65,0,.2,1)`, staggered 40ms), sticky clock column with a canvas of clock dials, rail + travelling dot, chapter opacity .52 → 1, progress fraction `01 / 05`, per-chapter tinted ambient light |
| Footer | dark rounded-top slab overlapping the section above by 32px, huge headline with dimmed second line, three columns, giant name watermark |
| Contact | one question at a time with progress bar, Back/Next, last step opens an email draft |
| Smooth scroll | Lenis on fine pointers; native momentum on touch |

## Implementation choices (ours)

- Next.js App Router, plain CSS with the measured tokens, no animation library: CSS transitions, WAAPI for the notebook and wall zoom, canvas for cord/portrait/dials/embers, Lenis for wheel smoothing.
- Our doors: AI & Agents (navy), Products & Web (plum), ML & Impact (sage), Tamrivo (burnt orange); fifth door Certificates (deep teal) reached with an arrow, keyboard focus, or the links under the wall.
- Default theme is **dark** until the cord is pulled (owner's request); the choice persists.
- No loader screen (the brief rules out a fake progress loader), no analytics or cookie banner.
- Room pages are real routes (`/work/*`, `/projects/*`, `/tamrivo`, `/certificates`) instead of embedded iframes.
- The card is CSS/DOM, not WebGL, so there is no graphics fallback to maintain.

## Unverified / approximated

- Exact cord stiffness and pull threshold (we use 46px stretch past rest and a rubber stop at 90px).
- Exact wall-zoom easing and duration (we use 900ms `cubic-bezier(.55,0,.75,.2)` after a 760ms swing).
- The reference's 3D card internals (it loads a WebGL engine); ours matches the visible layered result.
