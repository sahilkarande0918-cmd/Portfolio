// Captures read-only screenshots of public project deployments.
// Usage: node scripts/capture.mjs <outDir>   (then optimise into public/media/<slug>/)
// Only public landing/demo pages: never signs in, never submits forms.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "capture-out";
mkdirSync(out, { recursive: true });

const shots = [
  ["veridex-overview", "https://veridex-lake.vercel.app", 6000],
  ["janyojana-landing", "https://jan-yojna.vercel.app", 5000],
  ["heatshield-map", "https://heat-shield-gules.vercel.app", 9000],
  ["docutrack-landing", "https://docutrack-zeta.vercel.app", 5000],
  ["faultline-landing", "https://cisco-project-a1jk.vercel.app", 5000],
  ["cpu-scheduler", "https://cpu-scheduler-sand-rho.vercel.app", 5000],
  ["ai-data-processing", "https://ai-data-processing-system.vercel.app", 5000],
  ["reel-studio-landing", "https://reel-studio-taupe.vercel.app", 6000],
  ["aeropulse-live", "https://aero-pulse-ai-kohl.vercel.app", 8000],
  ["tamrivo-home", "https://tamrivo.com", 6000],
  ["agent-fleet-live", "https://agent-fleet-redteam.onrender.com", 70000],
];

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "msedge" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
for (const [name, url, wait] of shots) {
  const page = await ctx.newPage();
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(wait);
    await page.screenshot({ path: `${out}/${name}.png` });
    console.log(name, res?.status(), page.url(), await page.title());
  } catch (e) {
    console.log(name, "FAILED", String(e).slice(0, 120));
  }
  await page.close();
}
await browser.close();
