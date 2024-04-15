/* Copyright 2020-2024 Record Replay Inc. */

const { spawnSync } = require("child_process");
const path = require("path");

const root = __dirname;
const tsNode = path.join(root, "./node_modules/.bin/ts-node");
const project = path.join(root, "./tsconfig.json");

function runCommand(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: true,
    ...options,
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status != null && result.status !== 0) {
    const command = [cmd, ...args].join(" ");
    console.error(`Command ${command} failed with status ${result.status}`);
    throw new Error(`Command ${command} failed with status ${result.status}`);
  }
}

let replayDirPath = path.join(process.env.HOME, ".replay");
if (process.env.BUILDKITE_BUILD_CHECKOUT_PATH) {
  replayDirPath = path.join(process.env.BUILDKITE_BUILD_CHECKOUT_PATH, ".replay");
}

// Replay Runtime QA Wolf Tests
const env = {
  ...process.env,
  RECORD_REPLAY_API_KEY: process.env.REPLAY_API_KEY,
  RECORD_REPLAY_DIRECTORY: replayDirPath,
};

console.log("Running: npm ci --legacy-peer-deps on QA Wolf directory");
runCommand("npm", ["ci", "--legacy-peer-deps"], { cwd: root, env });

console.log("Running: npx @replayio/replay update-browsers");
runCommand("npx", ["@replayio/replay", "update-browsers"], { cwd: root, env });

console.log(`Running: ts-node --project ${project} run.ts`);
runCommand(tsNode, ["--project", project, "run.ts"], { cwd: root, env });
