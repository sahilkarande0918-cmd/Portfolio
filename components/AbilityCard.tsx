"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { abilities, site, tools } from "@/content/site";
import { closeDialog, openDialog } from "./dialog";

/*
  A physical trading card in a dark room. It leans toward the pointer, follows a drag around its
  vertical axis, and flips on double-click, F or the Flip button. One animation loop runs only
  while the card is open (it also draws the embers), and it stops the moment the card closes.
*/
export default function AbilityCard({ openKey }: { openKey: number }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const embers = useRef<HTMLCanvasElement>(null);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    openDialog(dlg.current);
  }, [openKey]);

  useEffect(() => {
    const d = dlg.current!, c = card.current!, cv = embers.current!, ctx = cv.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0, last = 0;
    let tx = 0, ty = 0, rx = 0, ry = 0, spin = 0, hover = false, drag: { x: number; s: number } | null = null;
    const parts = Array.from({ length: document.documentElement.classList.contains("lite") ? 14 : 46 }, () => seed({}));
    function seed(p: Record<string, number>, first = true) {
      p.x = Math.random();
      p.y = first ? Math.random() : 1.05;
      p.v = 0.02 + Math.random() * 0.05;
      p.r = 0.6 + Math.random() * 1.8;
      p.a = 0.25 + Math.random() * 0.55;
      p.w = Math.random() * Math.PI * 2;
      return p;
    }
    const size = () => {
      const dpr = document.documentElement.classList.contains("lite") ? 1 : Math.min(devicePixelRatio || 1, 1.5);
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const loop = (t: number) => {
      const dt = Math.min((t - (last || t)) / 1000, 0.05);
      last = t;
      // idle sway when nobody is touching it
      const idle = !hover && !drag && !reduce;
      const sx = idle ? Math.sin((t - t0) / 1600) * 0.35 : tx, sy = idle ? Math.cos((t - t0) / 2100) * 0.25 : ty;
      rx += (sy * -12 - rx) * 0.12;
      ry += (sx * 16 - ry) * 0.12;
      c.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      c.style.setProperty("--ry", `${(ry + spin).toFixed(2)}deg`);
      c.style.setProperty("--px", sx.toFixed(3));
      c.style.setProperty("--py", sy.toFixed(3));
      c.style.setProperty("--lift", hover || drag ? "1" : "0");
      if (!reduce) {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (const p of parts) {
          p.y -= p.v * dt;
          p.w += dt;
          if (p.y < -0.05) seed(p, false);
          const x = (p.x + Math.sin(p.w) * 0.01) * innerWidth, y = p.y * innerHeight;
          ctx.fillStyle = `rgba(255,${170 + p.r * 30 | 0},110,${p.a * Math.min(1, p.y * 3)})`;
          ctx.beginPath();
          ctx.arc(x, y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = d.open ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      size();
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      if (drag) spin = drag.s + (e.clientX - drag.x) * 0.6;
    };
    const down = (e: PointerEvent) => {
      c.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, s: spin };
    };
    const up = () => {
      if (!drag) return;
      drag = null;
      // settle on the nearest face
      const turns = Math.round(spin / 180);
      if (turns % 2) setFlip((f) => !f);
      spin = 0;
    };
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f" && !(e.target as HTMLElement).closest("input, textarea")) setFlip((f) => !f);
    };
    c.addEventListener("pointerenter", () => (hover = true));
    c.addEventListener("pointerleave", () => ((hover = false), (tx = ty = 0)));
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    d.addEventListener("keydown", key);
    const mo = new MutationObserver(() => d.open && start());
    mo.observe(d, { attributes: true, attributeFilter: ["open"] });
    addEventListener("resize", size);
    start();
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      removeEventListener("resize", size);
      d.removeEventListener("keydown", key);
    };
  }, []);

  return (
    <dialog className="holo" ref={dlg} aria-label="Sahil's ability card">
      <canvas className="holo__embers" ref={embers} aria-hidden="true" />
      <div className="holo__stage">
        <div className={`hc${flip ? " flip" : ""}`} ref={card} onDoubleClick={() => setFlip((f) => !f)}>
          <i className="hc__aura" />
          <div className="hc__in">
            <div className="hc__face hc__front">
              <div className="hc__frame">
                <p className="hc__name">{site.name}</p>
                <div className="hc__win">
                  <Image src="/portrait/color.webp" alt="" width={900} height={1300} sizes="22rem" draggable={false} />
                </div>
                <p className="hc__role">AI Systems Builder · Pune</p>
                <ul className="hc__rows">
                  {abilities.map((a) => (
                    <li key={a.name}>
                      <b>{a.name}</b>
                      <span>{a.proof}</span>
                    </li>
                  ))}
                </ul>
                <p className="hc__foot">
                  <span>
                    <small>based</small> Pune
                  </span>
                  <span>
                    <small>studying</small> MIT AOE
                  </span>
                  <span>
                    <small>building</small> Tamrivo
                  </span>
                </p>
                <i className="hc__gem hc__gem--tl" />
                <i className="hc__gem hc__gem--tr" />
                <i className="hc__gem hc__gem--bl" />
                <i className="hc__gem hc__gem--br" />
              </div>
              <i className="hc__foil" />
              <i className="hc__glare" />
            </div>
            <div className="hc__face hc__back">
              <svg className="hc__compass" viewBox="0 0 200 200" aria-hidden="true">
                <circle cx="100" cy="100" r="86" />
                <circle cx="100" cy="100" r="80" strokeDasharray="5 4" />
                <circle cx="100" cy="100" r="62" />
                <circle cx="100" cy="100" r="34" />
                {Array.from({ length: 12 }, (_, k) => {
                  const a = (k / 12) * Math.PI * 2;
                  return <line key={k} x1={100 + Math.cos(a) * 62} y1={100 + Math.sin(a) * 62} x2={100 + Math.cos(a) * 74} y2={100 + Math.sin(a) * 74} />;
                })}
                <path d="M100 40 L106 94 L160 100 L106 106 L100 160 L94 106 L40 100 L94 94 Z" />
              </svg>
              <p className="hc__now">Currently building Tamrivo</p>
              <ul className="hc__tools">
                {tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="hc__url">github.com/sahilkarande0918-cmd</p>
              <i className="hc__foil" />
              <i className="hc__glare" />
            </div>
          </div>
        </div>
        <p className="hc__hint">
          <span className="hm">Move across the card · drag to turn</span>
          <span className="ht">Drag to turn</span> · double-click or F to flip
        </p>
        <div className="holo__bar">
          <button className="holo__btn" onClick={() => setFlip((f) => !f)} aria-pressed={flip}>
            Flip
          </button>
          <a className="holo__btn" href={site.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="holo__btn" href={site.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
      <button className="holo__x" onClick={() => closeDialog(dlg.current)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 5l14 14M19 5 5 19" />
        </svg>
        Close
      </button>
    </dialog>
  );
}
