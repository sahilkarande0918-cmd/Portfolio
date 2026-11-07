// First scroll from the hero into the door wall: frame times while the wall appears for the first time.
// node scripts/firstpaint.mjs [base]   (runs 3 fresh loads; 4x CPU slowdown to stand in for a modest laptop)
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3130";
const b = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "msedge" });
for (let run = 0; run < 3; run++) {
  // PHONE=1: a 390px touch phone; CPU=n: slow the CPU n times (default 4)
  const phone = !!process.env.PHONE;
  const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1440, height: 900 } });
  // LOWEND=1: report a 4-core, 4 GB machine (how the lite profile is chosen on laptops)
  if (process.env.LOWEND) await ctx.addInitScript(() => { Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 4 }); Object.defineProperty(navigator, "deviceMemory", { get: () => 4 }); });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.CPU ?? 4) });
  await p.goto(base);
  await p.waitForTimeout(3500);
  await p.evaluate(() => {
    window.__f = [];
    let last = performance.now();
    const tick = (t) => {
      window.__f.push(t - last);
      last = t;
      if (window.__f.length < 3000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  if (phone) {
    // a thumb flick down to the doors and on into the story
    for (let i = 0; i < 40; i++) {
      await p.evaluate(() => scrollBy(0, 45));
      await p.waitForTimeout(16);
    }
  } else
    for (let i = 0; i < 30; i++) {
      await p.mouse.wheel(0, 60);
      await p.waitForTimeout(16);
    }
  await p.waitForTimeout(2200);
  const f = (await p.evaluate(() => window.__f)).slice(2);
  const s = [...f].sort((a, c) => a - c);
  console.log(`run ${run + 1}: ${f.length} frames, p95 ${s[Math.floor(0.95 * (s.length - 1))].toFixed(1)}ms, worst ${s.at(-1).toFixed(0)}ms, >33ms: ${f.filter((x) => x > 33).length}`);
  await ctx.close();
}
await b.close();
