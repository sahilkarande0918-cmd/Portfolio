// Visual review: node scripts/shots.mjs <outDir> [baseUrl]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "shots";
const base = process.argv[3] ?? "http://localhost:3130";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "msedge" });
const wait = (p, ms) => p.waitForTimeout(ms);
const to = (p, y) => p.evaluate((y) => (window.lenis ? window.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y)), y);

async function desktop(mode) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  if (mode) await ctx.addInitScript((m) => localStorage.setItem("mode", m), mode);
  const p = await ctx.newPage();
  const tag = mode ?? "dark";
  await p.goto(base);
  await wait(p, 2600);
  await p.screenshot({ path: `${out}/d-${tag}-hero.png` });
  await wait(p, 420);
  await p.screenshot({ path: `${out}/d-${tag}-flip.png` });
  await p.mouse.move(980, 300);
  for (let i = 0; i < 12; i++) await p.mouse.move(980 + i * 12, 300 + i * 18);
  await wait(p, 120);
  await p.screenshot({ path: `${out}/d-${tag}-reveal.png` });
  await to(p, await p.evaluate(() => document.getElementById("work").offsetTop));
  await wait(p, 2200);
  await p.screenshot({ path: `${out}/d-${tag}-doors.png` });
  const door = p.getByRole("link", { name: "Open the ML & Impact door" });
  await door.hover();
  await wait(p, 1000);
  await p.screenshot({ path: `${out}/d-${tag}-door-hover.png` });
  if (tag === "dark") {
    await door.click();
    await wait(p, 650);
    await p.screenshot({ path: `${out}/d-door-open.png` });
    await wait(p, 600);
    await p.screenshot({ path: `${out}/d-door-through.png` });
    await wait(p, 1600);
    await p.screenshot({ path: `${out}/d-room.png` });
    await p.goto(base + "/#work");
  }
  await to(p, await p.evaluate(() => document.getElementById("story").offsetTop + innerHeight * 1.4));
  await wait(p, 1400);
  await p.screenshot({ path: `${out}/d-${tag}-story.png` });
  await to(p, 99999);
  await wait(p, 900);
  await p.screenshot({ path: `${out}/d-${tag}-footer.png` });
  await to(p, 0);
  await wait(p, 600);
  await p.getByRole("button", { name: "My ability card" }).click();
  await wait(p, 1200);
  await p.mouse.move(800, 420);
  await wait(p, 500);
  await p.screenshot({ path: `${out}/d-${tag}-card.png` });
  await p.keyboard.press("f");
  await wait(p, 1000);
  await p.screenshot({ path: `${out}/d-${tag}-card-back.png` });
  await p.keyboard.press("Escape");
  await wait(p, 600);
  await p.getByRole("button", { name: "Let's talk" }).first().click();
  await wait(p, 700);
  await p.screenshot({ path: `${out}/d-${tag}-contact.png` });
  for (const [path, name, y] of [["/projects/aeropulse-ai", "case", 0], ["/projects/hemostat", "case-term", 0], ["/tamrivo", "tamrivo", 0], ["/certificates", "certs", 0], ["/certificates", "certs-line", "w-recognition"], ["/certificates", "certs-ibm", "w-ibm"], ["/work/products-web", "room2", 0]]) {
    await p.goto(base + path);
    await wait(p, 1500);
    if (y) {
      await to(p, await p.evaluate((id) => document.getElementById(id).offsetTop + 400, y));
      await wait(p, 900);
    }
    await p.screenshot({ path: `${out}/d-${tag}-${name}.png` });
  }
  await ctx.close();
}

async function phone() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(base);
  await wait(p, 2600);
  await p.screenshot({ path: `${out}/m-hero.png` });
  await to(p, await p.evaluate(() => document.getElementById("work").offsetTop));
  await wait(p, 1800);
  await p.screenshot({ path: `${out}/m-doors.png` });
  await to(p, await p.evaluate(() => document.getElementById("story").offsetTop + 700));
  await wait(p, 1200);
  await p.screenshot({ path: `${out}/m-story.png` });
  await to(p, 0);
  await p.getByRole("button", { name: "Menu" }).click();
  await wait(p, 900);
  await p.screenshot({ path: `${out}/m-menu.png` });
  await p.goto(base + "/certificates");
  await wait(p, 1200);
  await to(p, await p.evaluate(() => document.getElementById("w-anthropic").offsetTop + 300));
  await wait(p, 900);
  await p.screenshot({ path: `${out}/m-certs.png` });
  await p.goto(base + "/work/ai-agents");
  await wait(p, 1500);
  await to(p, 700);
  await wait(p, 600);
  await p.screenshot({ path: `${out}/m-room.png` });
  await ctx.close();
}

await desktop();
await desktop("light");
await phone();
await browser.close();
console.log("done");
