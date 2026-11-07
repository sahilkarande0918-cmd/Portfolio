"use client";
import { useEffect, useRef, useState } from "react";

/*
  A spiral-bound desk notebook: the top sheet lifts around the binding, comes over the rings
  showing its back, and drops away behind the stack, uncovering the next role underneath.
  Decorative only — the heading carries the full sentence for assistive tech.
*/
const HOLD = 2600;
const FLIP = 1000;

export default function FlipNotebook({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0);
  const root = useRef<HTMLSpanElement>(null);
  const leaf = useRef<HTMLSpanElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const [w, setW] = useState(7);
  const [fit, setFit] = useState(0.9);
  const next = (i + 1) % roles.length;
  const holes = Math.max(6, Math.round(w / 0.62));

  // page width follows the word; the whole notebook shrinks if the column is too narrow
  useEffect(() => {
    const m = measure.current!, el = root.current!;
    const widthOf = (s: string) => {
      m.textContent = s;
      return m.getBoundingClientRect().width / parseFloat(getComputedStyle(m).fontSize);
    };
    const size = () => {
      setW(Math.max(widthOf(roles[i]), widthOf(roles[next])) + 0.95);
      const longest = Math.max(...roles.map(widthOf)) + 0.95;
      const em = parseFloat(getComputedStyle(el.parentElement!).fontSize);
      const room = el.parentElement!.clientWidth - em * 0.3;
      setFit(Math.min(0.9, room / (longest * em)));
    };
    size();
    addEventListener("resize", size);
    return () => removeEventListener("resize", size);
  }, [i, next, roles]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true, t = 0, anim: Animation | null = null;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !t) schedule();
    });
    io.observe(root.current!);
    const flip = () => {
      t = 0;
      if (!visible || document.hidden) return;
      const el = leaf.current!;
      const shade = el.querySelector<HTMLElement>(".cal__shade")!;
      shade.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.4 }, { opacity: 0.8 }], { duration: FLIP * 0.6, easing: "ease-in" });
      anim = el.animate(
        [
          // no opacity here: fading a 3D layer flattens it and the hidden back faces show through
          { transform: "translateZ(.004em) rotateX(0deg)" },
          { transform: "translateZ(.2em) rotateX(110deg)", offset: 0.42 },
          { transform: "translateZ(.1em) rotateX(185deg)", offset: 0.72 },
          { transform: "translateZ(-.3em) rotateX(270deg)" },
        ],
        { duration: FLIP, easing: "cubic-bezier(.5,.05,.35,1)" },
      );
      anim.onfinish = () => {
        setI((n) => (n + 1) % roles.length);
        schedule();
      };
    };
    const schedule = () => {
      if (!t) t = window.setTimeout(flip, HOLD);
    };
    const onVis = () => !document.hidden && schedule();
    document.addEventListener("visibilitychange", onVis);
    schedule();
    return () => {
      clearTimeout(t);
      anim?.cancel();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [roles.length]);

  const dots = Array.from({ length: holes }, (_, k) => <i key={k} />);
  const no = (n: number) => `${String(n + 1).padStart(2, "0")} / ${String(roles.length).padStart(2, "0")}`;

  return (
    <span className="cal rv" ref={root} style={{ "--d": "520ms", fontSize: `${fit}em` } as React.CSSProperties} aria-hidden="true">
      <span className="cal__body" style={{ "--cal-w": `${w}em` } as React.CSSProperties}>
        <span className="cal__stand" />
        <span className="cal__stack">
          <span className="cal__page">
            <span className="cal__holes">{dots}</span>
            <span className="cal__word">{roles[next]}</span>
            <span className="cal__no">{no(next)}</span>
          </span>
          <span className="cal__leaf" ref={leaf} key={i}>
            <span className="cal__face">
              <span className="cal__holes">{dots}</span>
              <span className="cal__word">{roles[i]}</span>
              <span className="cal__no">{no(i)}</span>
              <span className="cal__shade" />
            </span>
            <span className="cal__rear">
              <span className="cal__holes">{dots}</span>
            </span>
          </span>
        </span>
        <span className="cal__rings">{dots}</span>
      </span>
      <span className="cal__measure" ref={measure} />
    </span>
  );
}
