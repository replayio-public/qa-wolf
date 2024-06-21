/* Copyright 2020-2024 Record Replay Inc. */

const { assertElement, assertText } = require("qawolf");
const { faker } = require("@faker-js/faker");
const { getInbox } = require("../getInbox");
const { test, expect } = require("@playwright/test");
const { chromium } = require("playwright");
const { devices, getExecutablePath } = require("@replayio/playwright");

// This is heinous, but I can't figure out how else to get it to work.
const dynamicImport = new Function("specifier", "return import(specifier)");

require("dotenv").config({ path: [".env.local", ".env.qawolf"] });

async function launch(opts) {
  const browser = await chromium.launch({
    ...opts,
    executablePath: devices["Replay Chromium"].launchOptions.executablePath,
    env: {
      ...(opts.env || {}),
      ...devices["Replay Chromium"].launchOptions.env,
    },
    headless: true,
  });
  return {
    browser,
    context: await browser.newContext(),
  };
}

let shared = {};
globalThis.runCommand = (cmd) => {
  // runs npx commands that we don't need locally
};

let Browser = null;

/*REPLACE_HELPER_CODE*/

const Name = "/*REPLACE_NAME*/";

test(Name, async () => {
  /*REPLACE_TEST_CODE*/
});
