/* Copyright 2020-2024 Record Replay Inc. */

const assert = require("assert");
const { assertElement, assertText, getValue } = require("qawolf");
const { faker } = require("@faker-js/faker");
const { getInbox } = require("../getInbox");
const { test, expect } = require("@playwright/test");
const { chromium } = require("playwright");
const { spawnSync } = require("child_process");
require("dotenv").config();

async function launch(opts) {
  // Inject an ID so we can match up replays after the run
  if (process.env.QAWOLF_RUN_ID) {
    const env = { ...process.env, ...opts.env };
    const metadata = env.RECORD_REPLAY_METADATA
      ? JSON.parse(env.RECORD_REPLAY_METADATA)
      : {};
    metadata["x-qawolf"] = { id: process.env.QAWOLF_RUN_ID };
    env.RECORD_REPLAY_METADATA = JSON.stringify(metadata);

    opts.env = env;
  }

  const browser = await chromium.launch({
    ...opts,
    headless: true,
  });
  return {
    browser,
    context: await browser.newContext(),
  };
}

let shared = {};
globalThis.runCommand = cmd => {
  // runs npx commands that we don't need locally
};

let Browser = null;

/*REPLACE_HELPER_CODE*/

const Name = "/*REPLACE_NAME*/";

test(Name, async () => {
  /*REPLACE_TEST_CODE*/
});
