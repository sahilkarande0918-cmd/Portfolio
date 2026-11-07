"use client";
import { useEffect } from "react";
import Lenis from "lenis";

// The reference glides on Lenis with a fine pointer and keeps native momentum on touch.
// Same here: wheel scrolling is eased, touch and reduced-motion users scroll natively.
export default function SmoothScroll() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: 0 }, prevent: (n) => !!n.closest?.("dialog, .doors__viewport") });
    (window as unknown as { lenis?: Lenis }).lenis = lenis;
    let id = 0;
    const raf = (t: number) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    // an open dialog freezes the page behind it
    const mo = new MutationObserver(() => (document.querySelector("dialog[open]") ? lenis.stop() : lenis.start()));
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
    return () => {
      cancelAnimationFrame(id);
      mo.disconnect();
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);
  return null;
}
