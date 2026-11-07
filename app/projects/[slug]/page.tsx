import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { bySlug, projects } from "@/content/projects";
import { doors } from "@/content/site";
import Device from "@/components/Device";
import MediaGallery from "@/components/MediaGallery";

export const dynamicParams = false;
export const generateStaticParams = () => projects.filter((p) => p.slug !== "tamrivo").map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = bySlug((await params).slug);
  return p ? { title: p.title, description: `${p.tagline}. ${p.problem}` } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = bySlug((await params).slug);
  if (!p || p.slug === "tamrivo") notFound();
  const room = doors.find((d) => d.slug === p.categories[0])!;
  const i = projects.indexOf(p);
  const next = projects.slice(i + 1).concat(projects.slice(0, i)).find((x) => x.slug !== "tamrivo" && !x.archive)!;

  return (
    <article className="roomv case" style={{ "--door": room.color } as React.CSSProperties}>
      <div className="roomv__glow" aria-hidden="true" />
      <div className="wrap">
        <header className="case__head" data-speed="0.12">
          <p className="card__meta">
            <Link href={room.href}>{room.name}</Link>
            <i />
            {p.kind}
          </p>
          <h1>{p.title}</h1>
          <p className="case__tag">{p.tagline}</p>
          <dl className="case__facts">
            <div>
              <dt>Status</dt>
              <dd>{p.status}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{p.year}</dd>
            </div>
            <div>
              <dt>Rooms</dt>
              <dd>{p.categories.map((c) => doors.find((d) => d.slug === c)?.name).join(", ")}</dd>
            </div>
          </dl>
          <div className="card__cta">
            {p.demo && (
              <a className="live" href={p.demo.url} target="_blank" rel="noreferrer">
                Open the live demo ↗
              </a>
            )}
            {p.repo && (
              <a className="ghost" href={p.repo} target="_blank" rel="noreferrer">
                Source on GitHub ↗
              </a>
            )}
          </div>
          {p.demo?.note && <p className="case__note">{p.demo.note}</p>}
        </header>

        <div className="case__hero" data-speed="-0.05">
          <Device p={p} eager />
        </div>

        <div className="case__grid">
          <section>
            <h2 className="lbl">Problem</h2>
            <p className="case__lead">{p.problem}</p>
          </section>
          <section>
            <h2 className="lbl">Approach</h2>
            <p className="case__lead">{p.solution}</p>
          </section>
          <section>
            <h2 className="lbl">Engineering decisions</h2>
            <ul className="case__list">
              {p.decisions.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="lbl">What it does</h2>
            <ul className="case__list">
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
          {p.stack.length > 0 && (
            <section>
              <h2 className="lbl">Stack</h2>
              <ul className="tags">
                {p.stack.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="lbl">My part</h2>
            <p>{p.contribution}</p>
            {p.team && <p className="case__team">Team: {p.team.join(", ")}</p>}
          </section>
          <section className="case__limits">
            <h2 className="lbl">Limits, stated plainly</h2>
            <ul className="case__list">
              {p.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>
          {p.repo && (
            <section>
              <h2 className="lbl">Evidence</h2>
              <ul className="case__list case__list--quiet">
                {p.evidence.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {p.terminal && p.device !== "terminal" && (
          <section className="case__media" aria-labelledby="termTitle">
            <h2 className="lbl" id="termTitle">
              Verified demo output
            </h2>
            <Device p={{ ...p, device: "terminal" }} />
          </section>
        )}

        {p.media.length > 0 && (
          <section className="case__media" aria-labelledby="shotsTitle">
            <h2 className="lbl" id="shotsTitle">
              Screenshots
            </h2>
            <MediaGallery media={p.media} title={p.title} />
          </section>
        )}

        <nav className="case__next" aria-label="Next project">
          <Link href={room.href}>← All of {room.name}</Link>
          <Link href={`/projects/${next.slug}`}>
            Next: <b>{next.title}</b> →
          </Link>
        </nav>
      </div>
    </article>
  );
}
