import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { doors } from "@/content/site";
import { inCategory, type Category } from "@/content/projects";
import ProjectGallery from "@/components/ProjectGallery";

const rooms = ["ai-agents", "products-web", "ml-impact"] as const;

export const dynamicParams = false;
export const generateStaticParams = () => rooms.map((slug) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = doors.find((x) => x.slug === slug);
  return d ? { title: d.name, description: d.intro } : {};
}

export default async function Room({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = doors.find((x) => x.slug === slug);
  if (!d || !rooms.includes(slug as (typeof rooms)[number])) notFound();
  // featured first, then the rest, archive last
  const list = inCategory(slug as Category).sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || Number(!!a.archive) - Number(!!b.archive));
  return (
    <div className="roomv" style={{ "--door": d.color } as React.CSSProperties}>
      <div className="roomv__glow" aria-hidden="true" />
      <div className="wrap">
        <header className="intro">
          <p className="lbl">Room · {d.tagline}</p>
          <h1>{d.name}</h1>
          <p>{d.intro}</p>
          <span className="count">
            {list.length} projects · {list.filter((p) => p.featured).length} featured
          </span>
        </header>
        <ProjectGallery projects={list} />
      </div>
    </div>
  );
}
