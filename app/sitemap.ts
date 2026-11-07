import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { projects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/tamrivo", "/certificates", "/work/ai-agents", "/work/products-web", "/work/ml-impact", ...projects.filter((p) => p.slug !== "tamrivo").map((p) => `/projects/${p.slug}`)];
  return paths.map((p) => ({ url: `${site.url}${p}` }));
}
