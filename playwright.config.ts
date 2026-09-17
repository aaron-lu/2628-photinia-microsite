import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "wide-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } } },
    { name: "tablet-edge-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 841, height: 900 } } },
    { name: "tablet-mobile-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 810, height: 1080 }, hasTouch: true } },
    { name: "phone-chromium", use: { ...devices["Pixel 7"] } },
    { name: "phone-webkit", use: { ...devices["iPhone 14"] } },
  ],
  webServer: {
    command: "npm run start -- -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
