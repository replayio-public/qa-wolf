/* Copyright 2020-2024 Record Replay Inc. */

import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";

import { queryApi } from "./queryApi";

async function getEnvironment(): Promise<Record<string, string>> {
  const EnvironmentId = process.env.QAWOLF_ENVIRONMENT_ID;
  const response = await queryApi(
    "environment",
    "query environment($id: String!) {\n  environment(where: {id: $id}) {\n    ...EnvironmentFragment\n    __typename\n  }\n}\n\nfragment EnvironmentFragment on Environment {\n  id\n  name\n  variablesJSON\n  variables(orderBy: {name: asc}) {\n    ...EnvironmentVariableFragment\n    __typename\n  }\n  __typename\n}\n\nfragment EnvironmentVariableFragment on EnvironmentVariable {\n  created_at\n  environment_id\n  id\n  name\n  value\n  __typename\n}\n",
    {
      id: EnvironmentId,
    }
  );

  const json = await response.json();
  return JSON.parse(json.data.environment.variablesJSON);
}

export default async function main(args: string[] = []) {
  const env = await getEnvironment();

  console.log("Setting environment variables:");

  const envDump = Object.keys(env)
    .map((key) => `${key}=${JSON.stringify(env[key])}`)
    .join("\n");

  fs.writeFileSync(path.join(__dirname, ".env.qawolf"), envDump);

  const allArgs = [
    "playwright",
    "test",
    "--config",
    path.join(__dirname, "playwright.config.js"),
    "--shard",
    `${Math.ceil(4 * Math.random())}/4`,
    ...args,
  ];
  console.log("Running: ", "npx" + " " + allArgs.join(" "));
  const result = spawnSync("npx", allArgs, {
    cwd: __dirname,
    env: {
      ...process.env,
      ...env,
    },
    stdio: "inherit",
    shell: true,
  });

  if (result.error) {
    console.error("SpawnSync Error:", result.error);
    throw new Error(result.error.message);
  }

  if (result.status != null && result.status !== 0) {
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
    console.log("Standard Output:", result.stdout.toString());
    console.log("Standard Error:", result.stderr.toString());
  }
}

if (require.main === module) {
  main(process.argv.slice(2))
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
