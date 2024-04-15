/* Copyright 2020-2024 Record Replay Inc. */

import sync from "./sync";
import test from "./test";
// import { replayRecording } from "../../../src/processing/replayRecording";

import {
  listAllRecordings,
  uploadAllRecordings,
  RecordingEntry,
} from "@replayio/replay";

const DispatchAddress =
  process.env["RECORD_REPLAY_DISPATCH_SERVER"] || "wss://dispatch.replay.io";

async function uploadAndProcess() {
  const filter = (r: RecordingEntry) => {
    if (r.status === "crashed") {
      return true;
    }

    if (
      "x-qawolf" in r.metadata &&
      r.metadata["x-qawolf"] &&
      typeof r.metadata["x-qawolf"] === "object"
    ) {
      return (
        (r.metadata["x-qawolf"] as Record<string, any>).id ===
        process.env.QAWOLF_RUN_ID
      );
    }

    return false;
  };

  const allRecordings = listAllRecordings({
    filter,
  });

  console.log(
    `Uploading ${allRecordings.length} recordings:\n  ${allRecordings.join(
      "\n  "
    )}`
  );
  try {
    await uploadAllRecordings({ filter });
  } catch (e) {
    console.error("Failed to upload recordings");
    console.error(e);

    return;
  }

  const postUploadRecordings = listAllRecordings({
    filter,
    all: true,
  });

  for (const r of postUploadRecordings) {
    try {
      if (r.status === "crashUploaded") {
        console.log("Crash report uploaded for", r.id);
      } else if (r.status === "uploaded") {
        console.log(`Uploaded https://app.replay.io/recording/${r.id}`);
        console.log("Processing", r.id);
        // await replayRecording(
        //   DispatchAddress,
        //   r.id,
        //   typeof r.metadata.uri === "string" ? r.metadata.uri : undefined,
        //   {
        //     verbose: false,
        //     apiKey: process.env.REPLAY_API_KEY,
        //   }
        // );
      } else {
        console.log("Failed to upload", r.id);
      }
    } catch (e) {
      console.error("Failed to process", r.id, e);
    }
  }
}

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
