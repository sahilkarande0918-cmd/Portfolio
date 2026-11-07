"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Lenis from "lenis";
import { lite } from "./walk";

/*
  Wheel scrolling glides on Lenis (fine pointers only; touch keeps native momentum, as on the
  reference). Parallax rides the same frame: any element with data-speed drifts against the
  scroll by that fraction of its distance from the middle of the screen. Offsets are measured once
  per page (and again on resize), so a frame only writes `translate` and never reads layout.
*/
type Item = { el: HTMLElement; s: number; mid: number };
let items: Item[] = [];

function apply(y: number) {
  const vh = innerHeight, c = y + vh / 2;
  for (const it of items) {
    const d = it.mid - c;
    if (Math.abs(d) > vh * 1.6) continue;
    it.el.style.translate = `0 ${(-d * it.s).toFixed(1)}px`;
  }
}
function measure() {
  // parallax is decoration: modest devices skip it entirely
  if (lite() || matchMedia("(prefers-reduced-motion: reduce)").matches) return (items = []);
  items = [...document.querySelectorAll<HTMLElement>("[data-speed]")].map((el) => {
    el.style.translate = "";
    const r = el.getBoundingClientRect();
    return { el, s: Number(el.dataset.speed), mid: r.top + scrollY + r.height / 2 };
  });
  apply(scrollY);
}

export default function SmoothScroll() {
  const path = usePathname();

  // once: the scroll engine
  useEffect(() => {
    let lenis: Lenis | null = null, id = 0, mo: MutationObserver | null = null, pending = 0;
    // eased wheel scrolling on capable machines; phones and modest laptops keep native scrolling
    if (!lite() && matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, anchors: { offset: 0 }, prevent: (n) => !!n.closest?.("dialog, .doors__viewport") });
      (window as unknown as { lenis?: Lenis }).lenis = lenis;
      lenis.on("scroll", (l: Lenis) => apply(l.scroll));
      const raf = (t: number) => {
        lenis!.raf(t);
        id = requestAnimationFrame(raf);
      };
      id = requestAnimationFrame(raf);
      // an open dialog freezes the page behind it (and walking through a door keeps it frozen)
      mo = new MutationObserver(() => {
        if (document.querySelector("dialog[open]")) lenis!.stop();
        else if (!document.documentElement.classList.contains("walking")) lenis!.start();
      });
      mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
    }
    const onScroll = () => {
      if (!lenis && !pending) pending = requestAnimationFrame(() => ((pending = 0), apply(scrollY)));
    };
    addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(document.body);
    document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(id);
      cancelAnimationFrame(pending);
      removeEventListener("scroll", onScroll);
      ro.disconnect();
      mo?.disconnect();
      lenis?.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  // each page: find its parallax layers
  useEffect(() => {
    const t = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(t);
  }, [path]);

  return null;
}
