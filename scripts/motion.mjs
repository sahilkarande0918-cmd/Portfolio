// Motion check: frame times while wheel-scrolling and during the door walk in and out, plus a filmstrip.
// node scripts/motion.mjs <outDir> [base]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "motion";
const base = process.argv[3] ?? "http://localhost:3130";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "msedge" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
// CPU=4 slows the page's CPU 4x, standing in for a modest laptop
if (process.env.CPU) await (await p.context().newCDPSession(p)).send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.CPU) });

const startFrames = () =>
  p.evaluate(() => {
    window.__f = [];
    let last = performance.now();
    const tick = (t) => {
      window.__f.push(t - last);
      last = t;
      if (window.__f.length < 2000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
const stats = async (label) => {
  const f = (await p.evaluate(() => window.__f.splice(0))).slice(2);
  const s = [...f].sort((a, b) => a - b);
  const pct = (q) => s[Math.floor(q * (s.length - 1))]?.toFixed(1);
  console.log(`${label}: ${f.length} frames, median ${pct(0.5)}ms, p95 ${pct(0.95)}ms, >33ms: ${f.filter((x) => x > 33).length}`);
};

await p.goto(base);
await p.waitForTimeout(2500);
await startFrames();
for (let i = 0; i < 90; i++) {
  await p.mouse.wheel(0, 110);
  await p.waitForTimeout(16);
}
await p.waitForTimeout(800);
await stats("wheel scroll, home");

await p.goto(base + "/#work");
await p.waitForTimeout(2200);
const door = p.getByRole("link", { name: "Open the ML & Impact door" });
await door.hover();
await p.waitForTimeout(700);
await p.screenshot({ path: `${out}/in-0-hover.png` });
await startFrames();
await door.click();
for (const [ms, n] of [[350, 1], [800, 2], [1250, 3], [1650, 4], [2400, 5]]) {
  await p.waitForTimeout(ms - (n > 1 ? [0, 350, 800, 1250, 1650][n - 1] : 0));
  await p.screenshot({ path: `${out}/in-${n}.png` });
}
await stats("door walk in");
await p.waitForTimeout(1200);
await startFrames();
await p.getByRole("link", { name: "Back to the doors" }).first().click();
let prev = 0;
for (const [ms, n] of [[250, 1], [700, 2], [1100, 3], [1600, 4], [2400, 5], [3200, 6]]) {
  await p.waitForTimeout(ms - prev);
  prev = ms;
  await p.screenshot({ path: `${out}/out-${n}.png` });
}
await stats("door walk out (whole sequence, incl. covered page swap)");
// the camera move itself: from the moment the back-out animation starts until it ends
await p.goto(base + "/work/ai-agents");
await p.waitForTimeout(1500);
await p.getByRole("link", { name: "Back to the doors" }).first().click();
await p.waitForFunction(() => document.querySelector(".passage")?.style.opacity === "0", null, { timeout: 8000, polling: 16 });
await startFrames();
await p.waitForTimeout(1300);
await stats("back-out camera move");
console.log("url after exit:", p.url(), "focused:", await p.evaluate(() => document.activeElement?.id));
await b.close();
