import Image from "next/image";
import type { Project } from "@/content/projects";

/** The project's own media in the right frame: a side-on monitor, a phone, a terminal or a spec plate. */
export default function Device({ p, flip = false, eager = false }: { p: Project; flip?: boolean; eager?: boolean }) {
  const m = p.media[0];
  if (p.device === "terminal" && p.terminal)
    return (
      <div className="stage">
        <div className={`term${flip ? " term--flip" : ""}`}>
          <div className="term__bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>{p.slug}</span>
          </div>
          <pre className="term__out" aria-label={`${p.title} demo output, from the repository's own results`}>
            {p.terminal}
          </pre>
        </div>
      </div>
    );
  if (m && p.device === "phone" && m.width / m.height < 1.2)
    return (
      <div className="stage stage--phone">
        <div className="phone">
          <div className="phone__screen">
            <Image src={m.src} alt={m.alt} fill sizes="(min-width: 900px) 22rem, 70vw" style={{ objectFit: "cover", objectPosition: "top" }} priority={eager} />
          </div>
        </div>
      </div>
    );
  if (m)
    return (
      <div className="stage">
        <div className={`mon${flip ? " mon--flip" : ""}`}>
          <div className="mon__body">
            <div className="mon__screen">
              <Image src={m.src} alt={m.alt} fill sizes="(min-width: 900px) 46vw, 92vw" style={{ objectFit: "cover", objectPosition: "top" }} priority={eager} />
            </div>
          </div>
          <div className="mon__neck" aria-hidden="true" />
          <div className="mon__foot" aria-hidden="true" />
        </div>
      </div>
    );
  return (
    <div className="stage">
      <div className="spec">
        <p className="spec__k">{p.kind}</p>
        <ul>
          {p.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p className="spec__s">{p.status}</p>
      </div>
    </div>
  );
}
