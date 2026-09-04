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
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npx serve . -l 3000 --no-clipboard",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        headless: true,
        ...(useSystemChromium && {
          launchOptions: { executablePath: systemChromium },
        }),
      },
    },
  ],
});
