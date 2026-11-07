"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { doors, site } from "@/content/site";
import { useClock } from "./useClock";

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function Footer() {
  const { time } = useClock();
  const top = useRef<HTMLAnchorElement>(null);

  // floating back-to-top: appears after the first screen and shows how far down you are
  useEffect(() => {
    let raf = 0;
    const on = () => {
      raf = 0;
      const t = top.current!;
      const max = document.documentElement.scrollHeight - innerHeight;
      t.classList.toggle("show", scrollY > innerHeight * 0.9);
      t.style.setProperty("--p", String(max > 0 ? scrollY / max : 0));
    };
    const s = () => raf || (raf = requestAnimationFrame(on));
    addEventListener("scroll", s, { passive: true });
    on();
    return () => removeEventListener("scroll", s);
  }, []);

  return (
    <div className="sfw">
      <footer className="sf" aria-labelledby="sfTitle">
        <div className="sf__in">
          <p className="sf__eye">
            <i />
            {site.status[0]}
          </p>
          <h2 className="sf__h" id="sfTitle">
            Have something to build?<span>Let&apos;s talk about it.</span>
          </h2>
          <p className="sf__p">
            Internships, collaborations, hackathon teams or a product that needs an engineer who reads the docs: tell me what you have in mind and it opens as an email draft to me.
          </p>
          <div className="sf__cta">
            <button className="sf__btn" data-contact>
              Let&apos;s talk
              <b>
                <Arrow />
              </b>
            </button>
            <Link className="sf__ghost" href="/#work">
              See my work
            </Link>
          </div>
          <div className="sf__cols">
            <div>
              <h3>Work</h3>
              <ul className="work">
                {doors.map((d) => (
                  <li key={d.slug}>
                    <Link href={d.href}>{d.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Elsewhere</h3>
              <ul>
                <li>
                  <a href={site.github} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href={site.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <button data-contact>Email</button>
                </li>
              </ul>
            </div>
            <div>
              <h3>Status</h3>
              <ul>
                <li>{site.status[0]}</li>
                <li>{site.status[1]}</li>
                <li>
                  Local time <span className="tnum">{time}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="sf__bot">
            <span>© {new Date().getFullYear()} Sahil Karande. Designed and built by Sahil.</span>
            <a href="#main">Back to top ↑</a>
          </div>
        </div>
        <p className="sf__word" aria-hidden="true">
          Sahil Karande
        </p>
      </footer>
      <a className="totop" href="#main" aria-label="Back to top" ref={top}>
        <svg className="ring" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" />
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </a>
    </div>
  );
}
