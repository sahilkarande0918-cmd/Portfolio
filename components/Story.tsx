"use client";
import { useEffect, useRef, useState } from "react";
import type { Chapter } from "@/content/site";

/*
  You scroll the chapters normally. The dot rides the line in step with the page, the year
  rolls to each chapter as it reaches the middle of the screen, the backdrop takes that
  chapter's colour, and the clock dials behind the year wind back with your scroll.
  Everything here is driven by one passive scroll listener, batched to a frame.
*/
export default function Story({ chapters }: { chapters: Chapter[] }) {
  const sec = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLCanvasElement>(null);
  const [at, setAt] = useState(0);
  const ch = chapters[at];
  const digits = String(ch.year).split("").map(Number);

  useEffect(() => {
    const ol = list.current!, m = meter.current!, canvas = bg.current!;
    const items = [...ol.querySelectorAll<HTMLElement>(".ch")];
    const ctx = canvas.getContext("2d")!;
    const drawBg = !matchMedia("(prefers-reduced-motion: reduce)").matches && matchMedia("(min-width: 768px)").matches;
    let raf = 0, W = 0, H = 0;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const fg = () => (document.documentElement.dataset.mode === "dark" ? "232,228,224" : "26,24,24");
    // a tunnel of clock dials, drawn only when the scroll moves
    const dials = (p: number) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * 0.52, c = fg();
      for (let k = 0; k < 6; k++) {
        const depth = (k + ((p * 3) % 1)) / 6;
        const r = 60 + depth * Math.min(W, H) * 0.62;
        const a = 0.09 * (1 - depth * 0.7);
        const rot = -p * Math.PI * 4 * (1 + k * 0.15);
        ctx.strokeStyle = `rgba(${c},${a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        for (let t = 0; t < 60; t++) {
          const ang = rot + (t / 60) * Math.PI * 2, len = t % 5 ? 5 : 12;
          ctx.moveTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
          ctx.lineTo(cx + Math.cos(ang) * (r - len), cy + Math.sin(ang) * (r - len));
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rot * 1.6) * r * 0.82, cy + Math.sin(rot * 1.6) * r * 0.82);
        ctx.strokeStyle = `rgba(${c},${a * 0.8})`;
        ctx.stroke();
      }
    };
    const update = () => {
      raf = 0;
      const r = ol.getBoundingClientRect(), mid = innerHeight / 2;
      const fp = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      ol.style.setProperty("--fp", String(fp));
      let idx = 0;
      items.forEach((it, i) => {
        if (it.getBoundingClientRect().top < mid) idx = i;
      });
      const p = items.length > 1 ? idx / (items.length - 1) : 1;
      m.style.setProperty("--p", String(Math.max(p, fp)));
      sec.current!.classList.toggle("at-start", fp <= 0);
      setAt(idx);
      if (drawBg) dials(fp);
    };
    const onScroll = () => raf || (raf = requestAnimationFrame(update));
    size();
    update();
    addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => (size(), onScroll());
    addEventListener("resize", onResize);
    addEventListener("modechange", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      removeEventListener("modechange", onScroll);
    };
  }, []);

  return (
    <section id="story" ref={sec} className={`story${ch.now ? " is-now" : ""}`} aria-labelledby="storyTitle">
      <div className="story__amb" aria-hidden="true">
        {chapters.map((c, i) => (
          <i key={c.title} className={i === at ? "on" : ""} style={{ "--c1": c.tint[0], "--c2": c.tint[1] } as React.CSSProperties} />
        ))}
      </div>
      <div className="story__pin">
        <div className="shell story__stage">
          <div className="story__clock">
            <canvas className="story__bg" ref={bg} aria-hidden="true" />
            <p className="eyebrow">My story</p>
            <h2 className="story__h" id="storyTitle">
              Let&apos;s go back in time.
            </h2>
            <div className="story__yr" aria-hidden="true">
              {digits.map((d, k) => (
                <span className="dg" key={k}>
                  <span className="dg__c" style={{ "--d": d } as React.CSSProperties}>
                    {Array.from({ length: 10 }, (_, n) => (
                      <i key={n}>{n}</i>
                    ))}
                  </span>
                </span>
              ))}
            </div>
            <p className="story__when" aria-hidden="true">
              {ch.when}
            </p>
            <div className="story__meter" ref={meter} aria-hidden="true">
              <svg className="story__rw" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>{String(at + 1).padStart(2, "0")}</span>
              <span className="story__of">/ {String(chapters.length).padStart(2, "0")}</span>
              <i className="story__bar">
                <b />
              </i>
            </div>
          </div>
          <div className="story__line">
            <div className="story__list" ref={list}>
              <span className="story__rail" aria-hidden="true" />
              <span className="story__fill" aria-hidden="true" />
              <span className="story__dot" aria-hidden="true" />
              <ol>
              {chapters.map((c, i) => (
                <li key={c.title} className={`ch${i === at ? " on" : ""}`}>
                  <p className="ch__date">{c.when}</p>
                  <h3 className="ch__t">{c.title}</h3>
                  <p className="ch__org">{c.org}</p>
                  <ul className="ch__b">
                    {c.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </li>
              ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
