// The walk between the doors and a room. Both pages are separate routes, so a single full-screen
// layer in the room's own colour carries you across: it is the colour the doorway's gap already is,
// so swapping the page underneath it is invisible.

export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
/** phones, tablets and modest laptops (set before first paint in the layout) */
export const lite = () => document.documentElement.classList.contains("lite");

let layer: HTMLDivElement | null = null;

/** show the room-coloured layer; `fade` ms to fade in (0 = instantly) */
export function cover(fade = 0) {
  layer ??= document.createElement("div");
  const el = layer;
  el.className = "passage";
  el.style.transition = fade ? `opacity ${fade}ms ease` : "none";
  if (!el.isConnected) document.body.appendChild(el);
  if (fade) {
    el.style.opacity = "0";
    el.getBoundingClientRect();
  }
  el.style.opacity = "1";
  return new Promise<void>((r) => setTimeout(r, fade));
}

export function uncover(fade = 400) {
  const el = layer;
  if (!el?.isConnected) return;
  el.style.transition = `opacity ${fade}ms ease`;
  el.style.opacity = "0";
  setTimeout(() => el.style.opacity === "0" && el.remove(), fade + 30);
}

/** header, cord and corner pills step aside while you walk; scrolling is held still */
const swallow = (e: Event) => e.preventDefault();
export function walking(on: boolean) {
  document.documentElement.classList.toggle("walking", on);
  const lenis = (window as unknown as { lenis?: { stop(): void; start(): void } }).lenis;
  if (on) {
    lenis?.stop();
    addEventListener("wheel", swallow, { passive: false });
    addEventListener("touchmove", swallow, { passive: false });
  } else {
    lenis?.start();
    removeEventListener("wheel", swallow);
    removeEventListener("touchmove", swallow);
  }
}

/** resolves once a freshly mounted page has painted twice and the main thread has gone idle (capped) */
export function settle(cap = 450) {
  const idle = (f: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(f, { timeout: cap }) : setTimeout(f, 120));
  const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
  // two painted frames, an idle moment, then two more so the freshly drawn wall is on screen before anything moves
  return frame()
    .then(frame)
    .then(() => new Promise<void>((r) => idle(r)))
    .then(frame)
    .then(frame);
}

/** the door to walk back out of, set by a room's "Back to the doors" */
export const EXIT_KEY = "door-exit";

/** a door leaf on a spring (mass 1, semi-implicit Euler): `set(t)` swings it toward t (0 shut … 1 open) */
export function spring(render: (x: number) => void, tension = 120, friction = 14) {
  let x = 0, v = 0, target = 0, raf = 0;
  const step = () => {
    const dt = 1 / 60, a = tension * (target - x) - friction * v;
    v += a * dt;
    x += v * dt;
    render(x);
    if (Math.abs(target - x) < 0.001 && Math.abs(v) < 0.001) {
      x = target;
      v = 0;
      render(x);
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(step);
  };
  return {
    set(t: number) {
      target = t;
      if (!raf) raf = requestAnimationFrame(step);
    },
    jump(t: number) {
      cancelAnimationFrame(raf);
      raf = 0;
      x = target = t;
      v = 0;
      render(x);
    },
  };
}
