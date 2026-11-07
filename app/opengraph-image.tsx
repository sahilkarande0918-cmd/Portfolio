import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sahil Karande — AI systems, agents and product engineering";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#e8e4e0", color: "#1a1818" }}>
        <div style={{ fontSize: 26, opacity: 0.7 }}>{site.eyebrow}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -3 }}>Hi, I&apos;m Sahil.</div>
          <div style={{ fontSize: 44, opacity: 0.6, marginTop: 12 }}>{site.roles.join(" · ")}</div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          {["#22304a", "#4a3540", "#7a8670", "#a4552c", "#2b3a3a"].map((c) => (
            <div key={c} style={{ width: 70, height: 150, background: c, borderRadius: "35px 35px 0 0" }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
