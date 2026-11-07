"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Media } from "@/content/projects";
import { closeDialog, openDialog } from "./dialog";

/** Screenshots as thumbnails; a click opens them full-size in an accessible lightbox. */
export default function MediaGallery({ media, title }: { media: Media[]; title: string }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [at, setAt] = useState(0);
  if (!media.length) return null;
  const m = media[at];
  const go = (d: number) => setAt((a) => (a + d + media.length) % media.length);
  return (
    <>
      <ul className="shots">
        {media.map((x, i) => (
          <li key={x.src}>
            <button
              className="shot"
              onClick={() => {
                setAt(i);
                openDialog(dlg.current);
              }}
              aria-label={`View screenshot ${i + 1} of ${media.length} full size: ${x.alt}`}
            >
              <Image src={x.src} alt={x.alt} width={x.width} height={x.height} sizes="(min-width: 900px) 40vw, 90vw" />
            </button>
            <p className="shot__cap">{x.alt}</p>
          </li>
        ))}
      </ul>
      <dialog
        className="lb"
        ref={dlg}
        aria-label={`${title} screenshots`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        onClick={(e) => e.target === dlg.current && closeDialog(dlg.current)}
      >
        <figure className="lb__fig">
          <Image src={m.src} alt={m.alt} width={m.width} height={m.height} sizes="92vw" />
          <figcaption>
            {m.alt} <small>· {m.source}, {m.captured}</small>
          </figcaption>
        </figure>
        <div className="lb__bar">
          {media.length > 1 && (
            <>
              <button className="holo__btn" onClick={() => go(-1)} aria-label="Previous screenshot">
                ←
              </button>
              <span className="tnum">
                {at + 1} / {media.length}
              </span>
              <button className="holo__btn" onClick={() => go(1)} aria-label="Next screenshot">
                →
              </button>
            </>
          )}
          <button className="holo__btn" onClick={() => closeDialog(dlg.current)}>
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
