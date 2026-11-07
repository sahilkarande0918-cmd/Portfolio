import { chromium } from "@playwright/test";
const b = await chromium.launch({ channel: "msedge" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2] + "/work/ai-agents");
await p.waitForTimeout(1500);
await p.evaluate(() => {
  window.__lt = [];
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: "longtask", buffered: false });
  window.__t0 = performance.now();
});
await p.getByRole("link", { name: "Back to the doors" }).first().click();
await p.waitForFunction(() => document.getElementById("work")?.getAnimations().length > 0, null, { timeout: 8000 });
const tA = await p.evaluate(() => Math.round(performance.now() - window.__t0));
await p.waitForTimeout(2500);
console.log("anim start at +" + tA + "ms; long tasks (start rel, dur):", JSON.stringify(await p.evaluate(() => window.__lt.map(([s, d]) => [s - Math.round(window.__t0), d]))));
// what layers paint: count of animations and composite reasons are not exposed; time paint via a trace
await b.close();
