"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Door } from "@/content/site";
import { animate } from "motion";
import { cover, EXIT_KEY, reduced, settle, spring, uncover, walking } from "./walk";

/*
  All five doors stand on one wall. Hovering cracks a door a few degrees into its room and describes
  the room beside it. Activating it presses the lever, swings the leaf in on a spring, then walks
  through: the whole wall scales up around the dark gap beside the open door until that darkness
  fills the screen, and the room takes over in the same colour. Coming back plays it in reverse:
  you back out of the doorway and the door swings shut behind you.

  The zoom is driven per frame on a layer promoted before you click, so the browser scales the
  existing picture instead of re-rendering the wall at its final size (which is what stutters).
  Each door is a real link, so it also works without script, in a new tab, or with motion off.
*/
const ANG = 70; // fully open, swung into the room
const HOVER = 0.1;
const ZOOM_MS = 1500;
const BACK_MS = 1300;

export default function Doors({ doors }: { doors: Door[] }) {
  const router = useRouter();
  const sec = useRef<HTMLElement>(null);
  const wall = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const leaves = useRef<ReturnType<typeof spring>[]>([]);
  const busy = useRef(false);
  const [seen, setSeen] = useState(false);
  const [on, setOn] = useState(-1);
  const [mobileAt, setMobileAt] = useState(0);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const phone = useSyncExternalStore(subPhone, () => matchMedia(PHONE).matches, () => false);

  const unit = (i: number) => sec.current!.querySelectorAll<HTMLElement>(".unit")[i];

  // where the zoom ends for door i: centred on the gap between the open leaf and the frame
  function geometry(i: number) {
    const u = unit(i);
    const r = u.querySelector(".opening")!.getBoundingClientRect();
    const dr = u.querySelector(".door")!.getBoundingClientRect();
    const gapL = Math.min(Math.max(dr.right, r.left), r.right - 6);
    const gw = Math.max(r.right - gapL, 10), gh = r.height;
    const cx = (gapL + r.right) / 2, cy = r.top + gh * 0.5;
    const sr = sec.current!.getBoundingClientRect();
    return { origin: `${cx - sr.left}px ${cy - sr.top}px`, tx: innerWidth / 2 - cx, ty: innerHeight / 2 - cy, sEnd: Math.max(innerWidth / gw, innerHeight / gh) * 1.15 };
  }

  useEffect(() => {
    const s = sec.current!;
    leaves.current = doors.map((_, i) => {
      const u = unit(i), leaf = u.querySelector<HTMLElement>(".door")!;
      // the frame's door stop: it never swings outward
      return spring((x) => {
        leaf.style.transform = `rotateY(${Math.max(0, x) * ANG}deg)`;
        u.style.setProperty("--o", Math.max(0, x).toFixed(3));
      });
    });

    // the doors stand up as the wall scrolls into view
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.2 });
    io.observe(s);

    let exit: string | null = null, last: string | null = null;
    try {
      exit = sessionStorage.getItem(EXIT_KEY);
      last = sessionStorage.getItem("door");
      sessionStorage.removeItem(EXIT_KEY);
      sessionStorage.removeItem("door");
    } catch {}
    const i = doors.findIndex((x) => x.slug === (exit ?? last));

    if (exit && i >= 0 && !reduced()) {
      // back from a room: stand in the doorway, then back out and let the door swing shut
      busy.current = true;
      const lenis = (window as unknown as { lenis?: { scrollTo(y: number, o: object): void } }).lenis;
      const top = s.getBoundingClientRect().top + scrollY;
      lenis?.scrollTo(top, { immediate: true, force: true });
      scrollTo(0, top);
      requestAnimationFrame(() => {
        setSeen(true);
        s.classList.remove("pre");
        s.classList.add("in");
        // promote the wall and let it paint once at its normal size while the screen is still covered:
        // the zoomed frames then reuse that picture instead of re-rasterising the wall at 14x
        s.dataset.lift = s.dataset.walk = "";
        leaves.current[i].jump(1);
        const g = geometry(i);
        // the camera path: the same exponential zoom as walking in, played backwards
        const at = (e: number) => `translate(${(g.tx * (1 - e)).toFixed(2)}px, ${(g.ty * (1 - e)).toFixed(2)}px) scale(${Math.exp(Math.log(g.sEnd) * (1 - e)).toFixed(4)})`;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            s.style.transformOrigin = g.origin;
            s.style.transform = at(0);
            // the page behind has only just mounted: wait, still covered, until the main thread is free
            settle().then(async () => {
              uncover(450);
              await animate(0, 1, { duration: BACK_MS / 1000, ease: [0.33, 1, 0.68, 1], onUpdate: (e) => (s.style.transform = at(e)) });
              s.style.transform = s.style.transformOrigin = "";
              delete s.dataset.walk;
              delete s.dataset.lift;
              leaves.current[i].set(0);
              walking(false);
              busy.current = false;
              document.getElementById(`door-${doors[i].slug}`)?.focus({ preventScroll: true });
            });
          }),
        );
      });
    } else if (exit || (last && location.hash === "#work")) {
      // motion off, or the browser's Back button: just stand in front of the same door again
      uncover(0);
      walking(false);
      requestAnimationFrame(() => {
        setSeen(true);
        if (i >= 0) document.getElementById(`door-${doors[i].slug}`)?.focus({ preventScroll: true });
      });
    }
    return () => {
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doors]);

  // phones: the description follows whichever door is centred in the swipe row
  useEffect(() => {
    const v = view.current!;
    const onScroll = () => {
      const units = [...v.querySelectorAll<HTMLElement>(".unit")];
      const c = v.scrollLeft + v.clientWidth / 2;
      let best = 0, bd = Infinity;
      units.forEach((u, k) => {
        const m = Math.abs(u.offsetLeft + u.offsetWidth / 2 - c);
        if (m < bd) {
          bd = m;
          best = k;
        }
      });
      setMobileAt(best);
    };
    v.addEventListener("scroll", onScroll, { passive: true });
    return () => v.removeEventListener("scroll", onScroll);
  }, []);

  function hover(i: number, el: HTMLElement) {
    if (busy.current) return;
    // promote the wall to its own layer before any click, so the zoom has nothing heavy left to do
    sec.current!.dataset.lift = "";
    leaves.current.forEach((l, k) => l.set(k === i ? HOVER : 0));
    setOn(i);
    if (phone || !wall.current) return setPos(null);
    // the description sits centred in the wall space beside the door, over the faded doors
    const w = wall.current.getBoundingClientRect(), r = el.getBoundingClientRect();
    const infoW = Math.min(352, w.width * 0.28);
    const right = r.left + r.width / 2 < w.left + w.width / 2;
    const left = right ? r.right + (w.right - r.right - infoW) / 2 : w.left + (r.left - w.left - infoW) / 2;
    setPos({ left: left - w.left, top: r.top - w.top + r.height * 0.3 });
  }
  function unhover() {
    if (busy.current) return;
    leaves.current.forEach((l) => l.set(0));
    setOn(-1);
  }

  function enter(i: number, e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (busy.current) return;
    const door = doors[i];
    try {
      sessionStorage.setItem("door", door.slug);
    } catch {}
    if (reduced()) return router.push(door.href);
    busy.current = true;
    router.prefetch(door.href);
    cursor.current?.classList.remove("on");
    setOn(-1);
    const u = unit(i);
    leaves.current.forEach((l, k) => k !== i && l.set(0));
    u.classList.add("press");
    setTimeout(() => u.classList.remove("press"), 380);
    setTimeout(() => leaves.current[i].set(1), 170);
    setTimeout(() => through(i, door.href), 760);
  }

  function through(i: number, href: string) {
    const s = sec.current!;
    walking(true);
    s.dataset.lift = s.dataset.walk = "";
    const g = geometry(i);
    s.style.transformOrigin = g.origin;
    let handed = false;
    animate(0, 1, {
      duration: ZOOM_MS / 1000,
      ease: [0.65, 0, 0.35, 1], // in-out cubic
      onUpdate: (e) => {
        const sc = Math.exp(Math.log(g.sEnd) * e); // an even speed of approach
        const f = Math.min(1, e * 1.6); // the door drifts to the centre early on
        s.style.transform = `translate(${(g.tx * f).toFixed(2)}px, ${(g.ty * f).toFixed(2)}px) scale(${sc.toFixed(4)})`;
        // the moment the room's darkness covers the screen, the room takes over: same colour, no blank
        if (!handed && (sc >= g.sEnd / 1.15 || e >= 1)) {
          handed = true;
          cover(0).then(() => router.push(href));
        }
      },
    });
  }

  // "Click to enter" badge sits exactly on the pointer
  const moveCursor = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || busy.current) return;
    const c = cursor.current!;
    c.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    c.classList.add("on");
  };

  const di = phone ? doors[mobileAt] : (doors[on] ?? null);

  return (
    <section
      id="work"
      ref={sec}
      className={`doors${seen ? " in" : " pre"}${on >= 0 && !phone ? " focus" : ""}`}
      aria-labelledby="doorsTitle"
      onPointerLeave={() => {
        unhover();
        cursor.current?.classList.remove("on");
      }}
    >
      <div className="shell doors__wall" ref={wall}>
        <h2 className="sr-only" id="doorsTitle">
          My work, one door per room
        </h2>
        <p className="paint" aria-hidden="true" data-speed="0.12">
          Every door, a room of work
        </p>
        <div className={`dinfo${di ? " on" : ""}`} style={pos && !phone ? { left: pos.left, top: pos.top } : undefined} aria-live="polite">
          {di && (
            <div key={di.slug}>
              <h3 className="dinfo__h">{di.name}</h3>
              <p className="dinfo__t">{di.tagline}</p>
              <ul className="dinfo__p">
                {di.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="doors__viewport" ref={view}>
          <ul className="doors__row">
            {doors.map((door, i) => (
              <li key={door.slug} className={`unit${on === i ? " on" : ""}`} style={{ "--i": i, "--door": door.color, "--door-dk": door.dark } as React.CSSProperties}>
                <a
                  id={`door-${door.slug}`}
                  href={door.href}
                  className="doorway"
                  aria-label={`Open the ${door.name} door`}
                  onMouseEnter={(e) => hover(i, e.currentTarget)}
                  onFocus={(e) => e.currentTarget.matches(":focus-visible") && hover(i, e.currentTarget)}
                  onBlur={unhover}
                  onPointerMove={moveCursor}
                  onPointerLeave={() => cursor.current?.classList.remove("on")}
                  onClick={(e) => enter(i, e)}
                >
                  <span className="casing" />
                  <span className="opening">
                    <span className="room" />
                    <span className="door">
                      <span className="door__flute" />
                      <span className="plate">{door.plate}</span>
                      <span className="handle">
                        <span className="handle__lever" />
                        <span className="handle__lock" />
                      </span>
                      <span className="door__shade" />
                    </span>
                    <span className="sill" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="doors__dots" aria-hidden="true">
          {doors.map((x, i) => (
            <i key={x.slug} className={i === mobileAt ? "on" : ""} />
          ))}
        </p>
        <p className="doors__hint" aria-hidden="true">
          Swipe along the wall
        </p>
      </div>
      <nav className="shell doors__links" aria-label="Rooms">
        {doors.map((x) => (
          <a key={x.slug} href={x.href}>
            {x.name}
          </a>
        ))}
      </nav>
      <div className="door-cursor" ref={cursor} aria-hidden="true">
        Click to enter
      </div>
    </section>
  );
}

const PHONE = "(max-width: 767.98px)";
const subPhone = (cb: () => void) => {
  const mq = matchMedia(PHONE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
