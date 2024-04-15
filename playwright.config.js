/* Copyright 2020-2024 Record Replay Inc. */

const { platform } = require("os");

// TODO(ryanjduffy) require this to enable fixture
// require("@replayio/playwright");

module.exports = {
  testDir: platform() === "win32" ? ".\\src\\tests" : "./src/tests",
  expect: { timeout: 20_000 },
  timeout: 120_000,
  use: {
    headless: true,
  },
};
