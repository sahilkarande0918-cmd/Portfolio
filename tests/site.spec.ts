import { expect, test } from "@playwright/test";

test("opens in dark mode; the cord switches to light once per pull and remembers it", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  const cord = page.getByRole("switch", { name: /pull the cord/i });
  await expect(cord).toHaveAttribute("aria-checked", "true");
  await cord.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
  await page.getByRole("switch", { name: /pull the cord/i }).focus();
  await page.keyboard.press(" ");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
});

test("light studio: switching on an inner page keeps the scroll and focus; its set pieces never show in dark", async ({ page }) => {
  await page.goto("/");
  // dark (the default) never renders the light-mode set pieces
  for (const s of [".studio", ".fig__ring"]) await expect(page.locator(`main ${s}`)).toBeHidden();
  await page.goto("/certificates");
  await page.evaluate(() => scrollTo(0, document.querySelector("#w-ibm")!.getBoundingClientRect().top + scrollY));
  await page.waitForTimeout(400);
  const y = await page.evaluate(() => scrollY);
  const cord = page.getByRole("switch", { name: /pull the cord/i });
  await cord.focus();
  // rapid repeated pulls: each one toggles, nothing reloads or scrolls, focus stays on the cord
  for (let i = 0; i < 5; i++) await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  // an odd number of pulls ends in light, and stays there once every transition has settled
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
  expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(2);
  await expect(cord).toBeFocused();
  await page.goto("/");
  await expect(page.locator("main .fig__ring")).toBeVisible();
});

test("dragging the cord down past its travel toggles exactly once", async ({ page, isMobile }) => {
  test.skip(isMobile, "pointer drag");
  await page.goto("/");
  await page.waitForTimeout(1500); // the rope drops in
  const box = (await page.getByRole("switch", { name: /pull the cord/i }).boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(x, y + i * 15);
  await page.mouse.up();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
});

test("each door opens its room; back returns to the doors", async ({ page }) => {
  await page.goto("/#work");
  await page.getByRole("link", { name: "Open the AI & Agents door" }).click();
  await expect(page).toHaveURL(/\/work\/ai-agents$/);
  await expect(page.getByRole("heading", { level: 1, name: "AI & Agents" })).toBeVisible();
  await page.getByRole("link", { name: "Back to the doors" }).first().click();
  await expect(page).toHaveURL(/\/#work$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/work\/ai-agents$/);
});

for (const path of ["/work/products-web", "/work/ml-impact", "/tamrivo", "/certificates", "/projects/hemostat", "/projects/reel-studio"]) {
  test(`deep link ${path} renders`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });
}

test("room search filters projects", async ({ page }) => {
  await page.goto("/work/ai-agents");
  await page.getByPlaceholder(/search by name/i).fill("hemostat");
  await expect(page.locator("main .card")).toHaveCount(1);
});

test("ability card opens, flips with F and closes with Escape", async ({ page, isMobile }) => {
  test.skip(isMobile, "card button sits behind the hero on phones in the same way; covered on desktop");
  await page.goto("/");
  await page.getByRole("button", { name: "My ability card" }).click();
  const dlg = page.getByRole("dialog", { name: /ability card/i });
  await expect(dlg).toBeVisible();
  await page.keyboard.press("f");
  await expect(page.locator(".hc")).toHaveClass(/flip/);
  await page.keyboard.press("Escape");
  await expect(dlg).toBeHidden();
});

test("contact walks through the steps and ends on an email draft, not a fake send", async ({ page }) => {
  await page.goto("/tamrivo");
  await page.getByRole("button", { name: /get in touch/i }).click();
  const dlg = page.getByRole("dialog");
  await dlg.getByText("A hackathon or collaboration").click();
  await dlg.getByText("Just exploring").click();
  await dlg.getByText("A student or developer").click();
  await expect(dlg.getByText("Last step: how do I reach you?")).toBeVisible();
  await dlg.getByRole("button", { name: "Back" }).click();
  await expect(dlg.getByText("Who's writing?")).toBeVisible();
  await dlg.getByRole("button", { name: "Next" }).click();
  await dlg.getByRole("button", { name: "Write the email" }).click();
  await expect(dlg.getByRole("alert")).toContainText("name");
});

test("certificates hang on lines and open full size", async ({ page }) => {
  await page.goto("/certificates");
  await expect(page.locator("main .world")).toHaveCount(5);
  // the prints sway on their pegs, so they are never "stable" in Playwright's sense
  await page.waitForTimeout(1200); // let the page hydrate and the scroll engine start
  await page.evaluate(() => scrollTo(0, document.getElementById("w-recognition")!.offsetTop));
  await page.waitForTimeout(600);
  await page.locator("main .paper").first().click({ force: true });
  const viewer = page.getByRole("dialog", { name: "Certificate viewer" });
  await expect(viewer).toBeVisible();
  await expect(viewer.locator("img")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
});

test("no horizontal page overflow", async ({ page }) => {
  for (const path of ["/", "/work/ai-agents", "/certificates", "/tamrivo", "/projects/aeropulse-ai"]) {
    await page.goto(path);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(over, path).toBeLessThanOrEqual(1);
  }
});

test("the portrait is fixed in the page: normal cursor, can't be dragged or selected", async ({ page }) => {
  await page.goto("/");
  // main: the idle warm-up copies drawn for a few frames sit outside it
  const fig = page.locator("main .fig");
  await expect(fig).toHaveCSS("cursor", "default");
  await expect(fig).toHaveCSS("user-select", "none");
  for (const img of await fig.locator("img").all()) {
    await expect(img).toHaveAttribute("draggable", "false");
    await expect(img).toHaveCSS("pointer-events", "none");
  }
  // a drag that starts on the photo is cancelled, so no floating copy appears
  const cancelled = await fig.evaluate((el) => !el.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true })));
  expect(cancelled).toBe(true);
});

test("modest devices and phones get the lite profile: native scrolling, no parallax", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.waitForTimeout(800);
  const state = await page.evaluate(() => ({ lite: document.documentElement.classList.contains("lite"), lenis: "lenis" in window }));
  if (isMobile) expect(state).toEqual({ lite: true, lenis: false });
  else expect(state.lite).toBe(false);
});
