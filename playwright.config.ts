import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 45000,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://127.0.0.1:5177",
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH,
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    },
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 5177",
    url: "http://127.0.0.1:5177",
    reuseExistingServer: !process.env.CI,
  },
});
