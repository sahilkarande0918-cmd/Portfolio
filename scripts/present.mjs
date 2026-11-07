// The definitive smoothness check: frames the GPU actually presented (viz DrawAndSwap) during the
// visible part of walking out of a room, and of walking in. Runs a real (headed) Edge window with GPU
// compositing, parked off-screen.   node scripts/present.mjs [base] [runs]
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3130";
const runs = Number(process.argv[3] ?? 3);
const b = await chromium.launch({
  channel: process.env.PW_CHANNEL ?? "msedge",
  headless: false,
  args: ["--window-position=-2600,0", "--window-size=1460,1000", "--disable-features=CalculateNativeWinOcclusion"],
});

// marks the visible phases in the trace: the cover starting to lift, the walk ending, the room page appearing
const markers = () => {
  const mark = (n) => console.timeStamp(n);
  new MutationObserver(() => {
    const c = document.querySelector(".passage");
    if (c && c.style.opacity === "0" && !c.__m) {
      c.__m = 1;
      mark("uncover");
    }
    if (!document.documentElement.classList.contains("walking") && window.__w) {
      window.__w = 0;
      mark("walk-end");
    }
    if (document.documentElement.classList.contains("walking")) window.__w = 1;
    if (document.querySelector(".roomv") && !window.__room) {
      window.__room = 1;
      mark("room");
    }
  }).observe(document.documentElement, { subtree: true, attributes: true, childList: true, attributeFilter: ["style", "class"] });
};

async function measure(p, cdp, label, act, wait, from, to) {
  const events = [];
  const onData = (d) => events.push(...d.value);
  cdp.on("Tracing.dataCollected", onData);
  const done = new Promise((r) => cdp.once("Tracing.tracingComplete", r));
  await cdp.send("Tracing.start", { categories: process.env.DEBUG ? "viz,gpu,cc,disabled-by-default-cc.debug,disabled-by-default-cc.debug.scheduler,devtools.timeline,disabled-by-default-devtools.timeline,blink.console,v8.execute,blink" : "viz,devtools.timeline,blink.console", transferMode: "ReportEvents" });
  await act();
  await p.waitForTimeout(wait);
  await cdp.send("Tracing.end");
  await done;
  cdp.off("Tracing.dataCollected", onData);
  const mk = (n) => events.find((e) => e.name === "TimeStamp" && e.args?.data?.message === n)?.ts;
  const start = typeof from === "string" ? mk(from) : from(events), end = mk(to) ?? Infinity;
  const swaps = events.filter((e) => e.name === "Display::DrawAndSwap").map((e) => e.ts).sort((a, c) => a - c);
  const vis = swaps.filter((t) => t >= start && t <= end);
  const gaps = vis.slice(1).map((t, i) => (t - vis[i]) / 1000);
  const s = [...gaps].sort((a, c) => a - c);
  const fmt = (x) => (x === undefined ? "-" : x.toFixed(1));
  if (process.env.DEBUG) {
    const names = {};
    for (const e of events) if (e.ph === "M" && e.name === "thread_name") names[`${e.pid}:${e.tid}`] = e.args.name;
    vis.slice(1).forEach((t, i) => {
      if (t - vis[i] < 25000) return;
      const busy = events.filter((e) => e.ph === "X" && e.dur > 6000 && e.ts < t && e.ts + e.dur > vis[i] && !/RunTask|ThreadController|Graphics.Pipeline|Scheduler/.test(e.name));
      const top = busy.sort((x, y) => y.dur - x.dur).slice(0, 6).map((e) => `${names[`${e.pid}:${e.tid}`] ?? e.tid}:${e.name} ${(e.dur / 1000).toFixed(0)}`);
      console.log(`   gap ${((t - vis[i]) / 1000).toFixed(0)}ms at +${((vis[i] - start) / 1000).toFixed(0)}ms: ${top.join(" | ")}`);
      if (process.env.DEBUG === "2") {
        const tiles = events.filter((e) => e.ts > vis[i] - 60000 && e.ts < t && /RasterTask|PictureLayerImpl|UpdateTiles|RasterScale|AdjustRasterScale|TileManager::AssignGpuMemory/.test(e.name));
        const seen = new Set();
        for (const e of tiles) {
          const k = e.name + JSON.stringify(e.args ?? {}).slice(0, 160);
          if (seen.has(k)) continue;
          seen.add(k);
          console.log(`      ${e.name} ${JSON.stringify(e.args ?? {}).slice(0, 200)}`);
          if (seen.size > 14) break;
        }
      }
    });
  }
  console.log(`${label}: ${vis.length} presented frames over ${fmt((vis.at(-1) - vis[0]) / 1000)}ms visible; median ${fmt(s[Math.floor(s.length / 2)])}ms, p95 ${fmt(s[Math.floor(0.95 * (s.length - 1))])}ms, worst ${fmt(s.at(-1))}ms, gaps >25ms: ${gaps.filter((g) => g > 25).length}, >50ms: ${gaps.filter((g) => g > 50).length}`);
}

for (let r = 0; r < runs; r++) {
  // FRESH=1: a brand-new, empty browser profile for every run (a first-time visitor)
  const p = process.env.FRESH ? await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage() : await b.newPage({ viewport: { width: 1440, height: 900 } });
  const cdp = await p.context().newCDPSession(p);
  // CPU=n: slow the page's CPU n times; LOWEND=1: report a 4-core, 4 GB laptop (the lite profile)
  if (process.env.CPU) await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.CPU) });
  if (process.env.LOWEND) await p.addInitScript(() => { Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 4 }); Object.defineProperty(navigator, "deviceMemory", { get: () => 4 }); });
  await p.goto(base + "/work/ml-impact");
  await p.waitForTimeout(2500);
  await p.evaluate(markers);
  // walking out: from the cover lifting until the door has shut and the walk ends
  await measure(p, cdp, `run ${r + 1} OUT`, () => p.getByRole("link", { name: "Back to the doors" }).first().click(), 4200, "uncover", "walk-end");
  await p.waitForTimeout(700);
  const door = p.getByRole("link", { name: "Open the ML & Impact door" });
  await door.hover();
  await p.waitForTimeout(700);
  await p.evaluate(markers);
  // walking in: from the click through the zoom to the room page fully shown (1.2 s after it mounts)
  await measure(p, cdp, `run ${r + 1} IN `, () => door.click(), 4200, (ev) => ev.find((e) => e.name === "EventDispatch" && e.args?.data?.type === "click")?.ts ?? 0, "room");
  await p.close();
}
await b.close();
