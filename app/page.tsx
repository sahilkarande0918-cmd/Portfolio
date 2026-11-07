import Link from "next/link";
import { doors, site, story } from "@/content/site";
import FlipNotebook from "@/components/FlipNotebook";
import Portrait from "@/components/Portrait";
import Doors from "@/components/Doors";
import Story from "@/components/Story";

export default function Home() {
  return (
    <>
      <section id="home" className="hero" aria-label="Introduction">
        <div className="hero__vig" aria-hidden="true" />
        <div className="hero__stage">
          <Portrait />
        </div>
        <div className="shell hero__content">
          <div className="hero__left">
            <p className="eyebrow rv" style={{ "--d": "200ms" } as React.CSSProperties}>
              {site.eyebrow}
            </p>
            <h1 className="h1">
              <span className="sr-only">Hi, I&apos;m Sahil. I am an {site.roles.join(", ").toLowerCase()}.</span>
              <span aria-hidden="true">
                <span className="line">
                  <span style={{ "--d": "250ms" } as React.CSSProperties}>Hi, I&apos;m Sahil.</span>
                </span>
                <span className="line">
                  <span className="soft" style={{ "--d": "370ms" } as React.CSSProperties}>
                    I am a
                  </span>
                </span>
                <span className="cal-line">
                  <FlipNotebook roles={site.roles} />
                </span>
              </span>
            </h1>
            <div className="ctas rv" style={{ "--d": "750ms" } as React.CSSProperties}>
              <button className="pill pill--dark pill--arrow" data-contact>
                Let&apos;s talk
                <span className="pill__badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </button>
              <Link className="pill pill--outline" href="/#work">
                See my work
              </Link>
            </div>
            <Link className="building rv" href={site.building.href} style={{ "--d": "900ms" } as React.CSSProperties}>
              <i aria-hidden="true" />
              {site.building.label}
            </Link>
          </div>
        </div>
        <div className="shell hero__bar rv">
          <span>{site.status[0]}</span>
          <span className="mid">{site.status[1]}</span>
          <a className="scroll" href="#work">
            Scroll to explore <i aria-hidden="true">↓</i>
          </a>
        </div>
      </section>
      <Doors doors={doors} />
      <Story chapters={story} />
    </>
  );
}
