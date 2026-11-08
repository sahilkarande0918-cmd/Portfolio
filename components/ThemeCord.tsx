"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { getMode, toggleMode } from "./mode";

/*
  A verlet rope hanging from above the top edge with a walnut pull on the end.
  Drag the pull down past the switch's travel and it clicks (once per gesture); let go and it
  swings back on its own momentum. Click, Enter or Space give it a quick tug. The loop sleeps
  whenever the rope hangs still, so it costs nothing while you scroll.
*/
const N = 18; // points
const G = 2200; // gravity px/s²
const STEP = 1 / 120;
const ITER = 14;
const PULL = 46; // switch travel (px of stretch) that clicks it
const STOP = 90; // rubbery end stop

type P = { x: number; y: number; px: number; py: number };

export default function ThemeCord() {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const hit = useRef<HTMLButtonElement>(null);
  const dark = useSyncExternalStore(subMode, () => getMode() === "dark", () => false);

  // The first light frame draws shapes the GPU never needed in dark (the studio's gradients and shadows):
  // ~80 ms stuck on a fresh browser, right as the cord is pulled. While the page sits idle in dark, draw a
  // 1%-opacity light copy of what's on screen for a few frames, so that work is done before the pull.
  useEffect(() => {
    let ghost: HTMLElement | undefined;
    const warm = () => {
      if (getMode() !== "dark") return;
      const src = [...document.querySelectorAll<HTMLElement>("main > *")].find((e) => {
        const r = e.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight;
      });
      if (!src) return;
      const copy = src.cloneNode(true) as HTMLElement;
      copy.querySelectorAll("[id]").forEach((e) => e.removeAttribute("id"));
      copy.removeAttribute("id");
      copy.style.marginTop = `${src.getBoundingClientRect().top}px`;
      ghost = document.createElement("div");
      ghost.dataset.mode = "light";
      ghost.inert = true;
      ghost.setAttribute("aria-hidden", "true");
      ghost.style.cssText = "position:fixed;inset:0;overflow:hidden;opacity:0.01;pointer-events:none;z-index:2147483647";
      ghost.append(copy);
      document.body.append(ghost);
      let n = 0;
      const tick = () => (++n < 4 ? requestAnimationFrame(tick) : ghost?.remove());
      requestAnimationFrame(tick);
    };
    const idle = "requestIdleCallback" in window ? requestIdleCallback(warm, { timeout: 3000 }) : setTimeout(warm, 2000);
    return () => {
      ("cancelIdleCallback" in window ? cancelIdleCallback : clearTimeout)(idle as number);
      ghost?.remove();
    };
  }, []);

  useEffect(() => {

    const canvas = cv.current!, ctx = canvas.getContext("2d")!, el = box.current!, btn = hit.current!;
    let W = 0, H = 0, ax = 0, len = 0, seg = 0, raf = 0, last = 0, acc = 0, still = 0;
    let pts: P[] = [];
    let drag: { id: number; x: number; y: number; moved: number; clicked: boolean } | null = null;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function layout(initial: boolean) {
      const dpr = document.documentElement.classList.contains("lite") ? 1.5 : Math.min(devicePixelRatio || 1, 2);
      W = el.clientWidth;
      H = el.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const clock = document.querySelector(".clock")?.getBoundingClientRect();
      const vw = innerWidth;
      let x: number;
      if (vw >= 1200) x = clock ? Math.min(clock.right + 30, vw - 22) : vw - 52;
      else x = clock ? clock.left - 20 : vw - 140;
      ax = x - (vw - W);
      // small screens: a short pull that rests in the header band, clear of the page content
      len = vw >= 1200 ? Math.min(Math.max(innerHeight * 0.3, 170), 290) : 46;
      seg = len / (N - 1);
      if (initial || !pts.length) {
        // folded up out of view; it drops and swings into place
        pts = Array.from({ length: N }, (_, i) => {
          const y = -12 - (reduce ? -i * seg : i * 4);
          return { x: ax, y, px: ax - (reduce ? 0 : 1.4), py: y };
        });
      } else pts[0].x = pts[0].px = ax;
      wake();
    }

    function simulate(dt: number) {
      const g = G * dt * dt;
      for (let i = 1; i < N; i++) {
        const p = pts[i];
        const vx = (p.x - p.px) * 0.985, vy = (p.y - p.py) * 0.985;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + g;
      }
      pts[0].x = pts[0].px = ax;
      pts[0].y = pts[0].py = -12;
      const end = pts[N - 1];
      if (drag) {
        // the hand sets the pull; beyond the travel the stop resists like rubber
        let dx = drag.x - ax, dy = drag.y + 12;
        const d = Math.hypot(dx, dy) || 1, over = d - len;
        if (over > 0) {
          const eff = len + STOP * (1 - Math.exp(-over / STOP));
          dx *= eff / d;
          dy *= eff / d;
        }
        end.x = ax + dx;
        end.y = -12 + dy;
        if (!drag.clicked && over > PULL) {
          drag.clicked = true;
          toggleMode();
        }
      }
      for (let k = 0; k < ITER; k++) {
        for (let i = 0; i < N - 1; i++) {
          const a = pts[i], b = pts[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
          const diff = (d - seg) / d;
          const fixA = i === 0, fixB = !!drag && i + 1 === N - 1;
          const wa = fixA ? 0 : fixB ? 1 : 0.5, wb = fixB ? 0 : fixA ? 1 : 0.5;
          a.x += dx * diff * wa;
          a.y += dy * diff * wa;
          b.x -= dx * diff * wb;
          b.y -= dy * diff * wb;
        }
      }
      const lo = H - 34;
      for (const p of pts) if (p.y > lo) p.y = lo;
      if (end.x < 16) end.x = 16;
      if (end.x > W - 16) end.x = W - 16;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const shadow = dark() ? 0.55 : 0.26;
      // light mode's studio casts warm umber shadows; dark keeps its black ones
      const sh = dark() ? "0,0,0" : "92,60,52";
      const path = () => {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < N - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.lineTo(pts[N - 1].x, pts[N - 1].y);
      };
      ctx.lineCap = "round";
      // cast shadow on the wall
      ctx.save();
      ctx.translate(5, 9);
      path();
      // a soft edge from two plain strokes: a canvas blur filter costs a full re-raster every frame
      ctx.strokeStyle = `rgba(${sh},${shadow * 0.35})`;
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.strokeStyle = `rgba(${sh},${shadow * 0.55})`;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();
      // braided cotton cord: dark edge, body, twist, lit side
      path();
      ctx.strokeStyle = "#5a4a36";
      ctx.lineWidth = 4.6;
      ctx.stroke();
      ctx.strokeStyle = "#cdb995";
      ctx.lineWidth = 3.2;
      ctx.stroke();
      ctx.setLineDash([2.2, 2.6]);
      ctx.strokeStyle = "rgba(120,96,64,.8)";
      ctx.lineWidth = 3.2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.save();
      ctx.translate(-0.8, 0);
      path();
      ctx.strokeStyle = "rgba(255,248,230,.55)";
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.restore();

      // the pull, aligned with the last segment
      const e = pts[N - 1], f = pts[N - 3];
      const ang = Math.atan2(e.y - f.y, e.x - f.x) - Math.PI / 2;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(ang);
      // shadow
      ctx.save();
      ctx.translate(6, 10);
      ctx.fillStyle = `rgba(${sh},${(shadow + 0.1) * 0.35})`;
      ctx.save();
      ctx.scale(1.25, 1.15);
      knob();
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = `rgba(${sh},${(shadow + 0.1) * 0.6})`;
      knob();
      ctx.fill();
      ctx.restore();
      // brass ferrule
      const fg = ctx.createLinearGradient(-3.5, 0, 3.5, 0);
      fg.addColorStop(0, "#7a5a26");
      fg.addColorStop(0.45, "#f3d99a");
      fg.addColorStop(1, "#6b4d1f");
      ctx.fillStyle = fg;
      ctx.fillRect(-3.2, -1, 6.4, 6);
      // turned walnut body
      const rg = ctx.createRadialGradient(-4, 12, 1, 0, 16, 16);
      rg.addColorStop(0, "#a2643a");
      rg.addColorStop(0.45, "#6a3a1d");
      rg.addColorStop(1, "#2a140a");
      ctx.fillStyle = rg;
      knob();
      ctx.fill();
      // bottom occlusion and specular streak
      const og = ctx.createLinearGradient(0, 4, 0, 32);
      og.addColorStop(0.6, "rgba(0,0,0,0)");
      og.addColorStop(1, "rgba(0,0,0,.35)");
      ctx.fillStyle = og;
      knob();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-4.2, 15, 1.4, 6, -0.12, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,236,210,.55)";
      ctx.fill();
      ctx.restore();

      btn.style.transform = `translate(${e.x}px, ${e.y + 16}px)`;
    }
    function knob() {
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.bezierCurveTo(5, 6, 10.5, 16, 9.5, 23);
      ctx.bezierCurveTo(8.8, 29, 4.5, 31.5, 0, 31.5);
      ctx.bezierCurveTo(-4.5, 31.5, -8.8, 29, -9.5, 23);
      ctx.bezierCurveTo(-10.5, 16, -5, 6, 0, 4);
      ctx.closePath();
    }
    const dark = () => getMode() === "dark";

    function frame(t: number) {
      const dt = Math.min((t - (last || t)) / 1000, 0.05);
      last = t;
      acc += dt;
      while (acc >= STEP) {
        simulate(STEP);
        acc -= STEP;
      }
      draw();
      let v = 0;
      for (const p of pts) v = Math.max(v, Math.abs(p.x - p.px) + Math.abs(p.y - p.py));
      still = v < 0.015 && !drag ? still + 1 : 0;
      raf = still > 45 ? 0 : requestAnimationFrame(frame);
      if (!raf) last = 0;
    }
    function wake() {
      still = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function local(e: PointerEvent) {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    const down = (e: PointerEvent) => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      const p = local(e);
      drag = { id: e.pointerId, ...p, moved: 0, clicked: false };
      el.classList.add("dragging");
      wake();
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = local(e);
      drag.moved += Math.hypot(p.x - drag.x, p.y - drag.y);
      drag.x = p.x;
      drag.y = p.y;
      wake();
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const tap = drag.moved < 6 && !drag.clicked && e.type === "pointerup";
      drag = null;
      el.classList.remove("dragging");
      if (tap) tug();
      wake();
    };
    // a quick tug: yank the pull a little past the click point
    function tug() {
      toggleMode();
      const end = pts[N - 1];
      end.py = end.y - 26;
      wake();
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tug();
      }
    };
    // brushing past the rope nudges it
    const brush = (e: PointerEvent) => {
      if (drag || e.pointerType !== "mouse") return;
      const p = local(e);
      if (p.x < 0 || p.y > H) return;
      for (let i = 2; i < N; i++) {
        const q = pts[i];
        if (Math.abs(q.x - p.x) < 10 && Math.abs(q.y - p.y) < seg) {
          q.px -= e.movementX * 0.35;
          wake();
          break;
        }
      }
    };

    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointermove", move);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("lostpointercapture", up);
    btn.addEventListener("keydown", key);
    addEventListener("pointermove", brush, { passive: true });
    const onResize = () => layout(false);
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    const clock = document.querySelector(".clock");
    if (clock) ro.observe(clock);
    layout(true);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", brush);
      removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="cord" ref={box}>
      <canvas ref={cv} aria-hidden="true" />
      <button ref={hit} className="cord__hit" role="switch" aria-checked={dark} aria-label="Dark mode (pull the cord)" />
    </div>
  );
}

const subMode = (cb: () => void) => {
  addEventListener("modechange", cb);
  return () => removeEventListener("modechange", cb);
};
