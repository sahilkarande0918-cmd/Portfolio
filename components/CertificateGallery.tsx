"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Certificate, World } from "@/content/certificates";
import { closeDialog, openDialog } from "./dialog";

const fmt = (d?: string) =>
  d
    ? new Date(d.length === 7 ? `${d}-01` : d).toLocaleDateString(
        "en-GB",
        d.length === 7 ? { month: "long", year: "numeric", timeZone: "UTC" } : { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
      )
    : "";

/*
  Each group hangs on its own line. The world pins while you scroll, scrolling walks you along
  the wire, and every certificate swings on its peg as it passes — a spring driven by how fast
  the line moved, plus a slow idle sway. One rAF loop for the whole room, and it only touches
  transforms; worlds that are off screen are skipped.
*/
export default function CertificateGallery({ worlds }: { worlds: World[] }) {
  const root = useRef<HTMLDivElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<{ list: Certificate[]; at: number } | null>(null);

  useEffect(() => {
    const els = [...root.current!.querySelectorAll<HTMLElement>(".world")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const calm = document.documentElement.classList.contains("lite"); // modest devices: swing only as the line moves
    const W = els.map((el) => ({
      el,
      track: el.querySelector<HTMLElement>(".track")!,
      bar: el.querySelector<HTMLElement>(".w-bar")!,
      prints: [...el.querySelectorAll<HTMLElement>(".print")].map((p) => ({ el: p, a: 0, v: 0, ph: Math.random() * 6.28, sp: 0.7 + Math.random() * 0.5 })),
      dist: 0,
      x: 0,
      lx: 0,
    }));
    const nav = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
    // every certificate hangs at the same height; each world is as tall as its line is long
    const layout = () => {
      const vh = innerHeight - nav(), phone = innerWidth < 768;
      W.forEach((w) => {
        const head = w.el.querySelector<HTMLElement>(".w-head")!.offsetHeight;
        const ph = Math.max(150, Math.min(vh - head - (phone ? 110 : 150), phone ? 280 : 400));
        w.el.style.setProperty("--ph", `${ph}px`);
        const last = w.prints[w.prints.length - 1].el, pad = parseFloat(getComputedStyle(w.track).paddingLeft) || 0;
        w.dist = Math.max(0, last.offsetLeft + last.offsetWidth + pad - innerWidth);
        w.el.dataset.dist = String(w.dist);
        // the wire travels faster than the page, so each section is a short scroll
        w.el.style.setProperty("--h", `${vh + w.dist * (phone ? 0.8 : 0.6)}px`);
      });
    };
    let raf = 0, lastT = 0;
    const frame = (t: number) => {
      const dt = Math.min(48, t - (lastT || t)) / 16.67;
      lastT = t;
      const n = nav();
      W.forEach((w) => {
        const r = w.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const span = Math.max(1, r.height - (innerHeight - n));
        const p = Math.min(1, Math.max(0, (n - r.top) / span));
        w.x = -p * w.dist;
        const vel = (w.x - w.lx) / Math.max(dt, 0.5);
        w.lx = w.x;
        w.track.style.transform = `translate3d(${w.x.toFixed(1)}px,0,0)`;
        w.bar.style.setProperty("--p", p.toFixed(4));
        if (reduce) return;
        w.prints.forEach((pr) => {
          const idle = calm ? 0 : Math.sin((t / 1000) * pr.sp + pr.ph) * 1.1;
          const target = Math.max(-11, Math.min(11, vel * 0.55)) + idle;
          pr.v += (target - pr.a) * 0.045 * dt;
          pr.v *= Math.pow(0.88, dt);
          pr.a += pr.v * dt;
          pr.el.style.transform = `rotate(${pr.a.toFixed(2)}deg)`;
        });
      });
      raf = requestAnimationFrame(frame);
    };
    // the loop only runs while the room is on screen
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) raf = requestAnimationFrame(frame);
      if (!e.isIntersecting) {
        cancelAnimationFrame(raf);
        raf = lastT = 0;
      }
    });
    io.observe(root.current!);
    layout();
    addEventListener("resize", layout);
    document.fonts?.ready.then(layout);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", layout);
    };
  }, []);

  // keyboard: tabbing to a certificate off the edge of the screen scrolls the line to it
  const reveal = (e: React.FocusEvent<HTMLButtonElement>) => {
    const world = e.currentTarget.closest<HTMLElement>(".world")!, print = e.currentTarget.closest<HTMLElement>(".print")!;
    const n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
    const span = parseFloat(world.style.getPropertyValue("--h")) - (innerHeight - n), dist = Number(world.dataset.dist);
    if (!(span > 0 && dist > 0)) return;
    const want = Math.min(dist, Math.max(0, print.offsetLeft + print.offsetWidth / 2 - innerWidth / 2));
    const top = world.getBoundingClientRect().top + scrollY - n + (want / dist) * span;
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, o: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(top, { immediate: true });
    else scrollTo({ top, behavior: "instant" });
  };

  const show = (list: Certificate[], at: number) => {
    setView({ list, at });
    openDialog(dlg.current);
  };
  const c = view ? view.list[view.at] : null;
  const go = (d: number) => setView((v) => v && { ...v, at: (v.at + d + v.list.length) % v.list.length });

  return (
    <>
      <nav className="w-jump" aria-label="Certificate groups">
        {worlds.map((w) => (
          <a key={w.key} href={`#w-${w.key}`}>
            {w.name} {w.em} <small>{w.items.length}</small>
          </a>
        ))}
      </nav>
      <div className="worlds" ref={root}>
        {worlds.map((w, wi) => (
          <section
            key={w.key}
            id={`w-${w.key}`}
            className="world"
            aria-labelledby={`wt-${w.key}`}
            style={{ "--wbg": w.bg, "--wfg": w.fg, "--wacc": w.acc } as React.CSSProperties}
          >
            <div className="pin">
              <header className="w-head">
                <p className="w-kicker">
                  {String(wi + 1).padStart(2, "0")}
                  <i />
                  {w.kicker}
                </p>
                <h2 className="w-name" id={`wt-${w.key}`}>
                  {w.name} <em>{w.em}</em>
                </h2>
                <div>
                  <p className="w-desc">{w.desc}</p>
                  <ul className="w-tags">
                    {w.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                    <li>{w.items.length} documents</li>
                  </ul>
                </div>
              </header>
              <div className="line">
                <ul className="track">
                  {hang(w.items).map(({ first, group }) => {
                    const x = group[0];
                    const deck = group.length > 1;
                    return (
                      <li className={`print${deck ? " deck" : ""}`} key={x.slug} style={{ "--ar": x.width / x.height } as React.CSSProperties}>
                        <span className="peg" aria-hidden="true" />
                        <button
                          className="paper"
                          onClick={() => show(w.items, first)}
                          onFocus={reveal}
                          aria-label={deck ? `${group.length} certificates: ${group.map((g) => g.title).join("; ")} — swipe through` : `${x.title}, ${x.issuer}${x.date ? `, ${fmt(x.date)}` : ""} — view full size`}
                        >
                          {/* the thumbs are pre-sized 640px webp (all 31: ~0.5 MB), so they load straight away and unresized:
                              lazy loading held back every print still off to the side of the line */}
                          <Image src={x.thumb} alt="" width={x.width} height={x.height} unoptimized loading="eager" decoding="async" />
                          <span className={`badge badge--${x.type.toLowerCase()}`}>{deck ? `${group.length} · swipe through` : x.type}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="w-foot" aria-hidden="true">
                <span className="w-bar">
                  <i />
                </span>
                <span className="w-hint">
                  {w.name} {w.em} · Scroll →
                </span>
              </div>
            </div>
          </section>
        ))}
      </div>

      <dialog
        className="lb"
        ref={dlg}
        aria-label="Certificate viewer"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        onClick={(e) => e.target === dlg.current && closeDialog(dlg.current)}
      >
        {c && (
          <figure className="lb__fig">
            <Image key={c.slug} src={c.full} alt={`${c.title}, ${c.issuer}${c.redacted ? " (student ID masked)" : ""}`} width={c.width} height={c.height} sizes="92vw" />
            <figcaption>
              <b>{c.title}</b> · {c.issuer}
              {c.date && ` · ${fmt(c.date)}`}
              {c.note && <small> · {c.note}</small>}
            </figcaption>
          </figure>
        )}
        <div className="lb__bar">
          <button className="holo__btn" onClick={() => go(-1)} aria-label="Previous certificate">
            ←
          </button>
          <span className="tnum">{view && `${view.at + 1} / ${view.list.length}`}</span>
          <button className="holo__btn" onClick={() => go(1)} aria-label="Next certificate">
            →
          </button>
          {c?.document && (
            <a className="holo__btn" href={c.document} target="_blank" rel="noreferrer">
              View original ↗
            </a>
          )}
          {c?.verify && (
            <a className="holo__btn" href={c.verify} target="_blank" rel="noreferrer">
              Verify ↗
            </a>
          )}
          <button className="holo__btn" onClick={() => closeDialog(dlg.current)}>
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}

/** consecutive certificates of one series hang together as a stack */
function hang(items: Certificate[]) {
  const out: { first: number; group: Certificate[] }[] = [];
  items.forEach((c, i) => {
    const prev = out[out.length - 1];
    if (prev && c.series && prev.group[0].series === c.series) prev.group.push(c);
    else out.push({ first: i, group: [c] });
  });
  return out;
}
