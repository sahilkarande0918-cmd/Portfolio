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
  await expect(page.locator(".card")).toHaveCount(1);
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
  await expect(page.locator(".world")).toHaveCount(5);
  // the prints sway on their pegs, so they are never "stable" in Playwright's sense
  await page.evaluate(() => scrollTo(0, document.getElementById("w-recognition")!.offsetTop));
  await page.waitForTimeout(600);
  await page.locator(".paper").first().click({ force: true });
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
