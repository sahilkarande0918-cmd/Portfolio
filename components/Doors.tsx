"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Door } from "@/content/site";

/*
  Hover or focus cracks a door open and describes the room on the wall beside it. Activating it
  presses the lever, swings the leaf on its hinge, then walks through: the whole wall scales up
  around the opening until the room's light fills the screen, and the room's page takes over.
  Each door is a real link, so it also works without script, in a new tab, or with motion off.
*/
export default function Doors({ doors }: { doors: Door[] }) {
  const router = useRouter();
  const sec = useRef<HTMLElement>(null);
  const wall = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [on, setOn] = useState(-1);
  const [open, setOpen] = useState(-1);
  const [press, setPress] = useState(-1);
  const [reveal, setReveal] = useState(false);
  const [mobileAt, setMobileAt] = useState(0);
  const phone = useSyncExternalStore(subPhone, () => matchMedia(PHONE).matches, () => false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const busy = useRef(false);
  const d = doors[on] ?? null;

  // the doors stand up as the wall scrolls into view
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.2 });
    io.observe(sec.current!);
    // back from a room: stand in front of the same door again, focus on it
    try {
      const last = sessionStorage.getItem("door");
      if (last && location.hash === "#work") {
        const i = doors.findIndex((x) => x.slug === last);
        requestAnimationFrame(() => {
          if (i >= 4) setReveal(true);
          setSeen(true);
          document.getElementById(`door-${last}`)?.focus({ preventScroll: true });
        });
      }
      sessionStorage.removeItem("door");
    } catch {}
    return () => io.disconnect();
  }, [doors]);

  // phones: the description follows whichever door is centred in the swipe row
  useEffect(() => {
    const v = view.current!;
    const onScroll = () => {
      if (getComputedStyle(v).overflowX !== "auto") return;
      const units = [...v.querySelectorAll<HTMLElement>(".unit")];
      const c = v.scrollLeft + v.clientWidth / 2;
      let best = 0, bd = Infinity;
      units.forEach((u, i) => {
        const m = Math.abs(u.offsetLeft + u.offsetWidth / 2 - c);
        if (m < bd) {
          bd = m;
          best = i;
        }
      });
      setMobileAt(best);
    };
    v.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      v.removeEventListener("scroll", onScroll);
    };
  }, []);

  function focusDoor(i: number, el: HTMLElement | null) {
    if (busy.current) return;
    setOn(i);
    if (!el || !wall.current || matchMedia("(max-width: 767.98px)").matches) return setPos(null);
    const w = wall.current.getBoundingClientRect(), r = el.getBoundingClientRect();
    const right = r.left - w.left + r.width / 2 < w.width / 2;
    const infoW = Math.min(352, w.width * 0.3);
    setPos({ left: right ? r.right - w.left + w.width * 0.06 : r.left - w.left - w.width * 0.06 - infoW, top: r.top - w.top + r.height * 0.3 });
  }

  function enter(i: number, e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (busy.current) return;
    const door = doors[i];
    try {
      sessionStorage.setItem("door", door.slug);
    } catch {}
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(door.href);
    busy.current = true;
    router.prefetch(door.href);
    setOn(i);
    setPress(i);
    cursor.current?.classList.remove("on");
    setTimeout(() => setOpen(i), 180);
    // walk through: scale the wall around the opening until the room fills the screen
    setTimeout(() => {
      const opening = document.getElementById(`door-${door.slug}`)?.querySelector(".opening") as HTMLElement | null;
      const w = wall.current!;
      const r = (opening ?? w).getBoundingClientRect(), wr = w.getBoundingClientRect();
      const ox = r.left - wr.left + r.width * 0.62, oy = r.top - wr.top + r.height * 0.55;
      const scale = Math.max(innerWidth / (r.width * 0.5), innerHeight / (r.height * 0.6)) * 1.3;
      sec.current!.classList.add("through");
      w.style.transformOrigin = `${ox}px ${oy}px`;
      w.animate([{ transform: "scale(1)" }, { transform: `scale(${scale})` }], { duration: 900, easing: "cubic-bezier(.55,0,.75,.2)", fill: "forwards" });
      const passage = document.createElement("div");
      passage.className = "passage";
      passage.style.background = `radial-gradient(70% 45% at 55% 30%, ${door.color}, #0d0b0a 120%)`;
      document.body.appendChild(passage);
      setTimeout(() => passage.classList.add("on"), 520);
      setTimeout(() => {
        router.push(door.href);
        setTimeout(() => passage.remove(), 900);
      }, 880);
    }, 760);
  }

  // "Click to enter" badge sits exactly on the pointer
  const moveCursor = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || busy.current) return;
    const c = cursor.current!;
    c.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    c.classList.add("on");
  };

  const di = phone ? doors[mobileAt] : d;

  return (
    <section
      id="work"
      ref={sec}
      className={`doors${seen ? " in" : " pre"}${on >= 0 ? " focus" : ""}${reveal ? " reveal" : ""}`}
      aria-labelledby="doorsTitle"
      onPointerLeave={() => {
        if (!busy.current) setOn(-1);
        cursor.current?.classList.remove("on");
      }}
    >
      <div className="shell doors__wall" ref={wall}>
        <h2 className="sr-only" id="doorsTitle">
          My work, one door per room
        </h2>
        <p className="paint" aria-hidden="true">
          Every door, a room of work
        </p>
        <div className={`dinfo${di ? " on" : ""}`} style={pos ? { left: pos.left, top: pos.top } : undefined} aria-live="polite">
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
              <li
                key={door.slug}
                className={`unit${i >= 4 ? " unit--extra" : ""}${on === i ? " on" : ""}${open === i ? " open" : ""}${press === i ? " press" : ""}`}
                style={{ "--i": i, "--door": door.color, "--door-dk": door.dark } as React.CSSProperties}
              >
                <a
                  id={`door-${door.slug}`}
                  href={door.href}
                  className="doorway"
                  aria-label={`Open the ${door.name} door`}
                  onMouseEnter={(e) => focusDoor(i, e.currentTarget)}
                  onFocus={(e) => {
                    // keyboard focus walks the wall along to doors that are out of view
                    if (!phone && (i >= 4) !== reveal && (i >= 4 || i === 0)) setReveal(i >= 4);
                    focusDoor(i, e.currentTarget);
                  }}
                  onBlur={() => !busy.current && setOn(-1)}
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
          <button className="doors__nav doors__nav--next" onClick={() => setReveal(true)} disabled={reveal} aria-label="Slide along the wall to the Certificates door">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <button className="doors__nav doors__nav--prev" onClick={() => setReveal(false)} disabled={!reveal} aria-label="Slide back along the wall">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </button>
        </div>
        <p className="doors__dots" aria-hidden="true">
          {doors.map((x, i) => (
            <i key={x.slug} className={i === mobileAt ? "on" : ""} />
          ))}
        </p>
        <p className="doors__hint" aria-hidden="true">
          <span className="hint-desk">{reveal ? "← Slide back for the other rooms" : "One more door along the wall →"}</span>
          <span className="hint-touch">Swipe along the wall</span>
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
