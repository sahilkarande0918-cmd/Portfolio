import { chromium } from "@playwright/test";
// Rough LCP/CLS check (mobile: 4x CPU, 1.6 Mbps, 150 ms). node scripts/perf.mjs <outDir> [base]
const out = process.argv[2];
const base = process.argv[3] ?? "http://localhost:3130";
const b = await chromium.launch({ channel: "msedge" });
for (const [name, vp, mobile] of [["mobile", { width: 390, height: 844 }, true], ["desktop", { width: 1440, height: 900 }, false]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  if (mobile) {
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  await p.addInitScript(() => {
    window.__cls = 0; window.__lcp = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => { const e = l.getEntries().at(-1); window.__lcp = e.startTime; window.__lcpEl = e.element?.tagName + "." + (e.element?.className || ""); }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await p.goto(base + "/", { waitUntil: "load" });
  await p.waitForTimeout(5000);
  console.log(name, JSON.stringify(await p.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(3), el: window.__lcpEl }))));
  if (mobile) {
    await p.screenshot({ path: out + "/v-m-hero.png" });
    await p.evaluate(() => scrollTo(0, document.getElementById("work").offsetTop));
    await p.waitForTimeout(2000);
    await p.screenshot({ path: out + "/v-m-doors.png" });
  } else {
    // catch the notebook mid-flip
    await p.waitForFunction(() => document.querySelector(".cal__leaf")?.getAnimations().length > 0, null, { timeout: 8000 });
    await p.waitForTimeout(560);
    await p.screenshot({ path: out + "/v-d-flip.png", clip: { x: 60, y: 300, width: 720, height: 320 } });
  }
  await ctx.close();
}
await b.close();
