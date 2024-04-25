/* Copyright 2020-2024 Record Replay Inc. */

import { spawnSync } from "child_process";
import path from "path";
import { getQAWolfEnvVars } from "./graphql/qaWolfEnv";

export async function runPlaywright() {
  const qaWolfEnvironmentVariables = await getQAWolfEnvVars();
  const allArgs = [
    "playwright",
    "test",
    "--config",
    path.join(__dirname, "..", "playwright.config.js"),
  ];
  console.log("Running: ", "npx" + " " + allArgs.join(" "), "\n");
  const result = spawnSync("npx", allArgs, {
    cwd: __dirname,
    env: {
      ...qaWolfEnvironmentVariables,
      ...process.env,
    },
    stdio: "inherit",
    shell: true,
  });

  if (result.error) {
    console.error("SpawnSync Error:", result.error);
    throw new Error(result.error.message);
  }

  if (
    (result.status != null && result.status !== 0) ||
    (!result.stderr && !result.stdout)
  ) {
    console.error("npx playwright test failed. Exit code:", result.status);
    if (result.stdout) {
      console.log("Standard Output:", result.stdout.toString());
    }
    if (result.stderr) {
      console.error("Standard Error:", result.stderr.toString());
      throw new Error(result.stderr.toString());
    }
  } else {
    console.log("npx playwright test succeeded.");
    console.log("Standard Output:", result.stdout?.toString());
    console.log("Standard Error:", result.stderr?.toString());
  }
}

if (require.main === module) {
  runPlaywright()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
