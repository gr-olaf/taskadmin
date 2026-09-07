const { defineConfig } = require("@playwright/test");
const fs = require("fs");

const systemChromium = "/usr/bin/chromium-browser";
const useSystemChromium = fs.existsSync(systemChromium);

module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  timeout: 15000,
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node server/app.js",
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        headless: true,
        chromiumSandbox: false,
        ...(useSystemChromium && {
          launchOptions: { executablePath: systemChromium },
        }),
      },
    },
  ],
});
