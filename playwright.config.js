/* Copyright 2020-2024 Record Replay Inc. */

const { platform } = require("os");
import { devices as replayDevices } from '@replayio/playwright'
import { devices } from "playwright";

// TODO(ryanjduffy) require this to enable fixture
// require("@replayio/playwright");

module.exports = {
  testDir: platform() === "win32" ? ".\\src\\tests" : "./src/tests",
  expect: { timeout: 20_000 },
  timeout: 120_000,
  // workers: 4,
  reporter:   [
    ['line'],
    [
    "@replayio/playwright/reporter",
    {
      apiKey: process.env.PLAYWRIGHT_REPLAY_API_KEY,
      upload: true,
    },
  ]],
  projects: [
    {
      name: "replay-chromium",
      use: { ...(replayDevices["Replay Chromium"] ) },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  use: {
    // headless: false,
    // headed: true,
    trace: 'on'
  },

  retries: 2,
};
