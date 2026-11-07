// Trace the first scroll into the door wall and list what the main thread spent its time on.
// node scripts/trace.mjs [base] [scroll|exit]
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3130";
const mode = process.argv[3] ?? "scroll";
const b = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "msedge" });
const phone = !!process.env.PHONE;
const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.CPU ?? 4) });
await p.goto(base + (mode === "exit" ? "/work/ai-agents" : "/"));
await p.waitForTimeout(3500);

const events = [];
cdp.on("Tracing.dataCollected", (d) => events.push(...d.value));
const done = new Promise((r) => cdp.once("Tracing.tracingComplete", r));
await cdp.send("Tracing.start", { categories: "devtools.timeline,disabled-by-default-devtools.timeline,v8.execute,blink", transferMode: "ReportEvents" });
if (mode === "exit") {
  await p.getByRole("link", { name: "Back to the doors" }).first().click();
  await p.waitForTimeout(3600);
} else if (phone) {
  for (let i = 0; i < 40; i++) {
    await p.evaluate(() => scrollBy(0, 45));
    await p.waitForTimeout(16);
  }
  await p.waitForTimeout(2200);
} else {
  for (let i = 0; i < 30; i++) {
    await p.mouse.wheel(0, 60);
    await p.waitForTimeout(16);
  }
  await p.waitForTimeout(2200);
}
await cdp.send("Tracing.end");
await done;

// main renderer thread = the one with the most top-level task time
const tasks = events.filter((e) => e.ph === "X" && e.name === "RunTask");
const byTid = {};
for (const t of tasks) byTid[t.tid] = (byTid[t.tid] ?? 0) + t.dur;
// the renderer's main thread is the one that runs BeginMainFrame
const main = events.find((e) => e.name === "WebFrameWidgetImpl::BeginMainFrame")?.tid ?? Number(Object.entries(byTid).sort((a, c) => c[1] - a[1])[0][0]);
const long = tasks.filter((t) => t.tid === main && t.dur > 30000);
console.log(`long main-thread tasks (>30ms): ${long.length}`);
for (const t of long.slice(0, 12)) {
  const inside = events.filter((e) => e.tid === main && e.ph === "X" && e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e.name !== "RunTask");
  const agg = {};
  for (const e of inside) agg[e.name] = (agg[e.name] ?? 0) + e.dur;
  const top = Object.entries(agg).sort((a, c) => c[1] - a[1]).slice(0, 5).map(([n, d]) => `${n} ${(d / 1000).toFixed(0)}ms`);
  const fn = inside.find((e) => e.name === "FunctionCall")?.args?.data;
  console.log(`- ${(t.dur / 1000).toFixed(0)}ms: ${top.join(", ")}${fn ? `  [${fn.functionName || "anon"} @ ${(fn.url || "").split("/").pop()}:${fn.lineNumber}]` : ""}`);
}
// the slowest frames on the main thread, and what filled them
const frames = events.filter((e) => e.ph === "X" && e.name === "WebFrameWidgetImpl::BeginMainFrame").sort((a, c) => c.dur - a.dur).slice(0, 5);
for (const f of frames) {
  const inside = events.filter((e) => e.tid === f.tid && e.ph === "X" && e.ts >= f.ts && e.ts + e.dur <= f.ts + f.dur && e.dur > 1500 && e !== f);
  const names = inside.sort((a, c) => c.dur - a.dur).slice(0, 7).map((e) => `${e.name}${e.args?.data?.functionName ? "(" + e.args.data.functionName + ")" : ""}${e.args?.elementCount ? "[" + e.args.elementCount + " els]" : ""} ${(e.dur / 1000).toFixed(1)}`);
  console.log(`frame ${(f.dur / 1000).toFixed(1)}ms: ${names.join(" > ")}`);
}
// the worst frame: which event, which function, and what dirtied the style
{
  const f = frames[0];
  const inF = events.filter((e) => e.tid === f.tid && e.ts >= f.ts && e.ts <= f.ts + f.dur);
  const ev = inF.filter((e) => e.name === "EventDispatch").map((e) => e.args?.data?.type);
  const fns = inF.filter((e) => e.name === "FunctionCall").map((e) => `${e.args?.data?.functionName || "?"}@${(e.args?.data?.url || "").split("/").pop()}:${e.args?.data?.lineNumber}:${e.args?.data?.columnNumber}`);
  console.log("worst frame events:", [...new Set(ev)].join(","), "| functions:", [...new Set(fns)].slice(0, 6).join(" "));
  // style invalidations recorded just before it
  const inv = events.filter((e) => e.tid === f.tid && /Invalidat/.test(e.name) && e.ts < f.ts + f.dur && e.ts > f.ts - 200000).map((e) => `${e.name}:${JSON.stringify(e.args?.data ?? {}).slice(0, 120)}`);
  console.log("invalidations:", [...new Set(inv)].slice(0, 8).join(" || "));
}
const recalc = events.filter((e) => e.ph === "X" && (e.name === "UpdateLayoutTree" || e.name === "Document::recalcStyle")).sort((a, c) => c.dur - a.dur).slice(0, 4);
console.log("biggest style recalcs:", recalc.map((e) => `${(e.dur / 1000).toFixed(1)}ms ${JSON.stringify(e.args?.elementCount ?? e.args?.data ?? "").slice(0, 60)}`).join(" | "));
// everything, by name, across threads
const tot = {};
for (const e of events) if (e.ph === "X" && e.dur && !["RunTask", "ThreadControllerImpl::RunTask"].includes(e.name)) tot[e.name] = (tot[e.name] ?? 0) + e.dur;
console.log("top work (all threads):", Object.entries(tot).sort((a, c) => c[1] - a[1]).slice(0, 14).map(([n, d]) => `${n} ${(d / 1000).toFixed(0)}ms`).join(" | "));
// the slowest individual paints / rasters
const big = events.filter((e) => e.ph === "X" && ["Paint", "RasterTask", "ImageDecodeTask", "Decode Image", "PaintImage", "Layout", "UpdateLayerTree"].includes(e.name)).sort((a, c) => c.dur - a.dur).slice(0, 6);
console.log("slowest:", big.map((e) => `${e.name} ${(e.dur / 1000).toFixed(1)}ms${e.args?.data?.url ? " " + e.args.data.url.split("/").pop() : ""}`).join(" | "));
await b.close();
