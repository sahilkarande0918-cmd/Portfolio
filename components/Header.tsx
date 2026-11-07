"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { bySlug } from "@/content/projects";
import { useClock } from "./useClock";
import { closeDialog, openDialog } from "./dialog";

export const nav = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/#work" },
  { label: "Tamrivo", href: "/tamrivo" },
  { label: "Certificates", href: "/certificates" },
  { label: "My Story", href: "/#story" },
];

export const Star = () => (
  <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
    <path d="M24 2c2.2 13.8 7.9 19.6 22 22-14.1 2.4-19.8 8.2-22 22-2.2-13.8-7.9-19.6-22-22 14.1-2.4 19.8-8.2 22-22Z" />
  </svg>
);

/** where "back" goes from a room or a project */
function backFor(path: string): { href: string; label: string } | null {
  if (path === "/") return null;
  const p = path.match(/^\/projects\/([^/]+)/);
  if (p) {
    const c = bySlug(p[1])?.categories[0];
    return c && c !== "tamrivo" ? { href: `/work/${c}`, label: "Back to the room" } : { href: "/#work", label: "Back to the doors" };
  }
  return { href: "/#work", label: "Back to the doors" };
}

export default function Header() {
  const path = usePathname();
  const { time, date } = useClock();
  const [stuck, setStuck] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const bar = useRef<HTMLElement>(null);
  const back = backFor(path);

  useEffect(() => {
    const on = () => setStuck(scrollY > 24);
    on();
    addEventListener("scroll", on, { passive: true });
    // sticky content in the rooms parks below the bar, never behind it
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty("--nav-h", `${bar.current!.offsetHeight}px`));
    ro.observe(bar.current!);
    return () => {
      removeEventListener("scroll", on);
      ro.disconnect();
    };
  }, []);

  const current = (href: string) => (href === "/" ? path === "/" : href.startsWith("/#") ? false : path.startsWith(href));

  return (
    <>
      <header className={`hdr${stuck || back ? " stuck" : ""}`} ref={bar}>
        <div className="shell hdr__in">
          <nav aria-label="Primary">
            <ul className="nav">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} aria-current={current(n.href) ? "page" : undefined}>
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <button data-contact>Contact</button>
              </li>
            </ul>
          </nav>
          <div className="hdr__right">
            <div className="chip clock" role="group" aria-label={`Local time in Pune, India: ${time}`}>
              <span className="clock__lbl">Local time</span>
              <span className="clock__time tnum">{time}</span>
              <span className="clock__sep" aria-hidden="true">
                •
              </span>
              <span className="clock__date">{date}</span>
            </div>
            <button className="chip menu-btn" aria-haspopup="dialog" aria-label="Menu" onClick={() => openDialog(menu.current)}>
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="word">Menu</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {back && (
        <Link className="backd" href={back.href}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          {back.label}
        </Link>
      )}

      <dialog className="navm" ref={menu} aria-label="Menu" onClick={(e) => (e.target as HTMLElement).closest("a, [data-contact]") && closeDialog(menu.current)}>
        <div className="shell navm__top">
          <span className="brand">
            <Star />
            {site.short}
          </span>
          <button className="close-btn" onClick={() => closeDialog(menu.current)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l16 16M20 4 4 20" />
            </svg>
            Close
          </button>
        </div>
        <nav className="shell navm__nav" aria-label="Menu">
          <ul>
            {[...(back ? [back] : []), ...nav].map((n, i) => (
              <li key={n.href + n.label}>
                <Link className="navm__item" href={n.href} style={{ "--d": `${i * 50 + 80}ms` } as React.CSSProperties}>
                  <small>{String(i + 1).padStart(2, "0")}</small>
                  <span>{n.label}</span>
                </Link>
              </li>
            ))}
            <li>
              <button className="navm__item" data-contact style={{ "--d": `${(nav.length + (back ? 1 : 0)) * 50 + 80}ms` } as React.CSSProperties}>
                <small>{String(nav.length + (back ? 2 : 1)).padStart(2, "0")}</small>
                <span>Contact</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="shell navm__bot">
          <span>
            Local time · {time} · Pune
          </span>
          <span>
            <a href={site.github} target="_blank" rel="noreferrer">
              GitHub
            </a>{" "}
            ·{" "}
            <a href={site.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </span>
        </div>
      </dialog>
    </>
  );
}
