"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Project } from "@/content/projects";
import Device from "./Device";

/** A room's projects as stacked editorial panels, with a quick search across title, stack and kind. */
export default function ProjectGallery({ projects }: { projects: Project[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? projects.filter((p) => [p.title, p.tagline, p.kind, p.status, ...p.stack].join(" ").toLowerCase().includes(s)) : projects;
  }, [q, projects]);
  const main = list.filter((p) => !p.archive);
  const archive = list.filter((p) => p.archive);

  return (
    <>
      <div className="finder">
        <label className="finder__box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="sr-only">Search projects in this room</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, stack or status" />
        </label>
        <p className="finder__n" aria-live="polite">
          {list.length} {list.length === 1 ? "project" : "projects"}
        </p>
      </div>
      <div className="stack">
        {main.map((p, i) => (
          <article className={`card${i % 2 ? " flip" : ""}`} key={p.slug} style={{ "--i": i } as React.CSSProperties}>
            <div className="card__in">
              <div className="card__info">
                <p className="card__meta">
                  <span className="no">{String(i + 1).padStart(2, "0")}</span>
                  <i />
                  {p.kind}
                </p>
                <h2>
                  <Link href={`/projects/${p.slug}`}>{p.title}</Link>
                </h2>
                <p className="sub">{p.tagline}</p>
                <p className="desc">{p.solution}</p>
                <ul className="tags">
                  {p.stack.slice(0, 5).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="card__cta">
                  <Link className="live" href={`/projects/${p.slug}`}>
                    Case study
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                  {p.demo && (
                    <a className="ghost" href={p.demo.url} target="_blank" rel="noreferrer">
                      Live demo ↗
                    </a>
                  )}
                  <span className="note">{p.status}</span>
                </div>
              </div>
              <Device p={p} flip={i % 2 === 1} eager={i === 0} />
            </div>
          </article>
        ))}
        {!list.length && <p className="empty">Nothing in this room matches “{q}”.</p>}
      </div>
      {archive.length > 0 && (
        <section className="archive" aria-labelledby="archiveTitle">
          <h2 id="archiveTitle" className="lbl">
            Coursework & archive
          </h2>
          <ul>
            {archive.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`}>
                  <b>{p.title}</b>
                  <span>{p.tagline}</span>
                  <em>{p.kind}</em>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
