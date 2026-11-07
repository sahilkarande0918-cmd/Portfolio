import type { Metadata } from "next";
import { bySlug } from "@/content/projects";

export const metadata: Metadata = {
  title: "Tamrivo",
  description: "I'm building Tamrivo, an AI-search visibility platform for brands and agencies.",
};

const flow = [
  { k: "Measure", t: "Sample the AI search answers for the prompts a brand cares about, and record who appears." },
  { k: "Compare", t: "Line the brand up against its competitors across those answers." },
  { k: "Diagnose", t: "Find where competitors are winning, and why the evidence points that way." },
  { k: "Generate fix", t: "Turn the gaps into evidence-based improvements an agency can act on." },
];

export default function Tamrivo() {
  const p = bySlug("tamrivo")!;
  return (
    <div className="roomv tam" style={{ "--door": "#a4552c" } as React.CSSProperties}>
      <div className="roomv__glow" aria-hidden="true" />
      <div className="wrap">
        <header className="intro">
          <p className="lbl">
            <span className="tam__status">
              <i aria-hidden="true" />
              {p.status}
            </span>
          </p>
          <h1>Tamrivo</h1>
          <p className="tam__lede">
            I&apos;m building Tamrivo, an AI-search visibility platform that helps brands and agencies see where competitors appear in AI answers and identify evidence-based
            improvements.
          </p>
        </header>

        <section className="tam__grid">
          <div className="tam__panel">
            <h2 className="lbl">The problem</h2>
            <p>{p.problem}</p>
          </div>
          <div className="tam__panel">
            <h2 className="lbl">Who it&apos;s for</h2>
            <p>SEO, content and digital-marketing agencies first; B2B SaaS and direct-to-consumer marketing teams after that.</p>
          </div>
          <div className="tam__panel">
            <h2 className="lbl">My role</h2>
            <p>Founder. I&apos;m building the product while studying CSE (AI &amp; ML) at MIT Academy of Engineering.</p>
          </div>
        </section>

        <section aria-labelledby="flowTitle">
          <h2 className="lbl" id="flowTitle">
            How it works
          </h2>
          <ol className="tam__flow">
            {flow.map((f, i) => (
              <li key={f.k}>
                <span className="tam__n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{f.k}</h3>
                <p>{f.t}</p>
              </li>
            ))}
          </ol>
          <p className="tam__fine">
            AI answers are probabilistic: Tamrivo reports observed visibility from sampled answers, and does not promise rankings, traffic or revenue. Still being built — no
            launch, customers or revenue are claimed here.
          </p>
        </section>

        <div className="tam__cta">
          <p>Interested in Tamrivo, or want to hear when it opens?</p>
          <button className="pill pill--dark pill--arrow" data-contact>
            Get in touch
            <span className="pill__badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
