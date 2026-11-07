"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const AbilityCard = dynamic(() => import("./AbilityCard"), { ssr: false });

/*
  The portrait starts in black and white; colour is painted in along the cursor's trail and
  fades back out behind it. Touch and keyboard users get the same reveal from the toggle
  (or a tap on the photo), which crossfades the whole portrait to colour.
*/
export default function Portrait() {
  const fig = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(false);
  const [card, setCard] = useState(0); // bumps to open the card

  useEffect(() => {
    const el = fig.current!, canvas = cv.current!, ctx = canvas.getContext("2d")!;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const img = new window.Image();
    img.src = "/portrait/color.webp";
    const mask = document.createElement("canvas"), mx = mask.getContext("2d")!;
    let W = 0, H = 0, raf = 0, life = 0, lx = -1, ly = -1;
    const size = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      mask.width = Math.ceil(W / 3);
      mask.height = Math.ceil(H / 3);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const paint = (x: number, y: number) => {
      const r = W * 0.19 / 3; // a generous brush: the colour opens a wide patch, not a pinhole
      const g = mx.createRadialGradient(x / 3, y / 3, 0, x / 3, y / 3, r);
      g.addColorStop(0, "rgba(0,0,0,.95)");
      g.addColorStop(0.55, "rgba(0,0,0,.6)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      mx.fillStyle = g;
      mx.beginPath();
      mx.arc(x / 3, y / 3, r, 0, Math.PI * 2);
      mx.fill();
    };
    const frame = () => {
      // the trail fades out behind the cursor
      mx.globalCompositeOperation = "destination-out";
      mx.fillStyle = "rgba(0,0,0,.026)";
      mx.fillRect(0, 0, mask.width, mask.height);
      mx.globalCompositeOperation = "source-over";
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      if (img.complete) ctx.drawImage(img, 0, 0, W, H);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, 0, 0, W, H);
      raf = --life > 0 ? requestAnimationFrame(frame) : 0;
      if (!raf) {
        ctx.clearRect(0, 0, W, H);
        mx.clearRect(0, 0, mask.width, mask.height);
      }
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (lx >= 0) {
        const steps = Math.ceil(Math.hypot(x - lx, y - ly) / 12);
        for (let s = 1; s <= steps; s++) paint(lx + ((x - lx) * s) / steps, ly + ((y - ly) * s) / steps);
      } else paint(x, y);
      lx = x;
      ly = y;
      life = 190;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const leave = () => (lx = ly = -1);
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      className={`fig${color ? " color" : ""}`}
      ref={fig}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.target === e.currentTarget && e.preventDefault()}
      onPointerUp={(e) => {
        if (e.pointerType !== "mouse" && !(e.target as HTMLElement).closest("button")) setColor((c) => !c);
      }}
    >
      <Image src="/portrait/bw.webp" alt="" fill priority draggable={false} sizes="(min-width: 1024px) 40vw, 80vw" />
      <Image className="fig__color" src="/portrait/color.webp" alt="" fill draggable={false} sizes="(min-width: 1024px) 40vw, 80vw" />
      <canvas ref={cv} aria-hidden="true" />
      <span className="sr-only">Portrait of Sahil Karande in a burgundy blazer and black shirt, arms crossed.</span>
      <button className="fig__card" aria-haspopup="dialog" onClick={() => setCard((n) => n + 1)}>
        My ability card
      </button>
      <button className="fig__toggle" aria-pressed={color} aria-label="Show the portrait in colour" onClick={() => setColor((c) => !c)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />
        </svg>
      </button>
      {card > 0 && <AbilityCard openKey={card} />}
    </div>
  );
}
