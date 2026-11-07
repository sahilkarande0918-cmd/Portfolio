import { defineConfig } from "@playwright/test";

// Runs against a production server: `npm run build && npm start -- -p 3130`, then `npm run test:e2e`.
export default defineConfig({
  testDir: "tests",
  timeout: 45_000,
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3130", channel: process.env.PW_CHANNEL ?? "msedge", viewport: { width: 1440, height: 900 } },
  projects: [
    { name: "desktop" },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
  ],
});
