/* Copyright 2020-2024 Record Replay Inc. */

import sync from "./sync";
import test from "./test";
import dotenv from "dotenv";

import { uploadAndProcess } from "./uploadAndProcess";

// how do i use multiple configs

dotenv.config({ path: [".env.local", "env.qawolf"] });

async function main(playwrightArgs: string[]) {
  process.env.QAWOLF_RUN_ID =
    process.env.QAWOLF_RUN_ID ||
    `qawolf-${Date.now()}-${Math.round(10000000 * Math.random()).toString(16)}`;

  console.log("-- Syncing Tests --");
  await sync();

  console.log("-- Running Tests --");
  try {
    await test(playwrightArgs);
  } catch (e) {
    console.error("Failed to run tests", e);
  }

  if (process.env.REPLAY_API_KEY) {
    console.log("-- Uploading and Processing Tests --");
    await uploadAndProcess();
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).then(() => process.exit(0));
}
