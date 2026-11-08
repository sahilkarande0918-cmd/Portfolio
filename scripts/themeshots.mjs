// Fixed-state screenshots of every page and overlay, per theme and viewport, for before/after review and
// dark-mode regression checks.   node scripts/themeshots.mjs <base> <outDir> [dark,light] [desktop,tablet,phone]
import { chromium } from "@playwright/test";
import { mkdirSync } from "fs";

const [base = "http://localhost:3130", out = "shots/theme", modeArg = "dark,light", vpArg = "desktop,tablet,phone"] = process.argv.slice(2);
const VP = { desktop: { width: 1440, height: 900 }, tablet: { width: 834, height: 1112 }, phone: { width: 390, height: 844 } };
// the clock and the swaying cord change between runs; everything else should be pixel-stable
const FREEZE = ".clock__time,.clock__date,.clock__lbl,.navm__bot span:first-child,.sf .tnum{visibility:hidden!important}.cord{visibility:hidden!important}";

const views = [
  ["home-hero", "/", null],
  ["home-doors", "/", "#work"],
  ["home-story", "/", "#story", 600],
  ["home-footer", "/", "footer"],
  ["room-ai-agents", "/work/ai-agents", null],
  ["room-ai-agents-card", "/work/ai-agents", ".card"],
  ["room-ai-agents-archive", "/work/ai-agents", ".archive"],
  ["room-products-web", "/work/products-web", ".card"],
  ["room-ml-impact", "/work/ml-impact", ".card"],
  ["project-head", "/projects/reel-studio", null],
  ["project-body", "/projects/reel-studio", ".case__grid"],
  ["project-media", "/projects/reel-studio", ".case__media"],
  ["project-next", "/projects/reel-studio", ".case__next"],
  ["tamrivo", "/tamrivo", null],
  ["tamrivo-flow", "/tamrivo", ".tam__flow"],
  ["certs-intro", "/certificates", null],
  ...["recognition", "anthropic", "ibm", "cisco", "more"].map((k) => [`certs-${k}`, "/certificates", `#w-${k}`, 200]),
];
const overlays = [
  ["card-front", "/", async (p) => (await p.evaluate(() => document.querySelector(".fig__card").click()), p.waitForTimeout(1200))],
  ["card-back", "/", async (p) => (await p.evaluate(() => document.querySelector(".fig__card").click()), await p.waitForTimeout(900), await p.keyboard.press("f"), p.waitForTimeout(1200))],
  ["contact-1", "/", async (p) => (await p.evaluate(() => document.querySelector(".ctas [data-contact]").click()), p.waitForTimeout(900))],
  ["contact-error", "/", async (p) => { await p.evaluate(() => document.querySelector(".ctas [data-contact]").click()); await p.waitForTimeout(700); await p.locator(".modal .mform button[type=submit]").first().click(); await p.waitForTimeout(500); }],
  ["contact-picked", "/", async (p) => { await p.evaluate(() => document.querySelector(".ctas [data-contact]").click()); await p.waitForTimeout(700); await p.locator(".modal label.qc").first().click(); await p.waitForTimeout(400); }],
  ["shot-lightbox", "/projects/reel-studio", async (p) => { await p.locator(".shot").first().scrollIntoViewIfNeeded(); await p.locator(".shot").first().click(); await p.waitForTimeout(900); }],
  ["cert-viewer", "/certificates", async (p) => { await p.evaluate(() => document.querySelector(".paper").click()); await p.waitForTimeout(900); }],
  ["menu", "/", async (p) => { const m = p.locator(".menu-btn"); if (await m.isVisible()) { await m.click(); await p.waitForTimeout(900); } else return "skip"; }],
];

const b = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "msedge" });
for (const mode of modeArg.split(",")) for (const vp of vpArg.split(",")) {
  const dir = `${out}/${mode}/${vp}`;
  mkdirSync(dir, { recursive: true });
  const phone = vp === "phone";
  const ctx = await b.newContext({ viewport: VP[vp], reducedMotion: "reduce", isMobile: phone, hasTouch: phone, deviceScaleFactor: 1 });
  await ctx.addInitScript((m) => { try { localStorage.setItem("mode", m); } catch {} }, mode);
  const page = async (path) => {
    const p = await ctx.newPage();
    await p.goto(base + path, { waitUntil: "networkidle" });
    await p.addStyleTag({ content: FREEZE });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(1500);
    return p;
  };
  for (const [name, path, target, extra = 0] of views) {
    const p = await page(path);
    if (target) {
      await p.evaluate(([t, x]) => { const el = document.querySelector(t); if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY + x); }, [target, extra]);
      await p.waitForTimeout(1300);
    }
    await p.screenshot({ path: `${dir}/${name}.png` });
    await p.close();
  }
  for (const [name, path, act] of overlays) {
    const p = await page(path);
    try {
      if ((await act(p)) !== "skip") await p.screenshot({ path: `${dir}/${name}.png` });
    } catch (e) {
      console.log(`${mode}/${vp}/${name} failed: ${e.message.split("\n")[0]}`);
    }
    await p.close();
  }
  await ctx.close();
  console.log(`${mode}/${vp} done`);
}
await b.close();
