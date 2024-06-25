/* Copyright 2020-2024 Record Replay Inc. */

import { devices as replayDevices } from "@replayio/playwright";
import path from "path";

module.exports = {
  testDir: path.join(".", "src", "generated_tests"),
  expect: { timeout: 30_000 },
  workers: 4,
  timeout: 180_000,
  retries: 0,
  reporter: [
    [
      "@replayio/playwright/reporter",
      {
        apiKey: process.env.REPLAY_API_KEY,
        upload: true,
      },
    ],
    ["line"],
  ],
  projects: [
    {
      name: "replay-chromium",
      use: { ...replayDevices["Replay Chromium"] },
    },
  ],
};
