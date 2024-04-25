/* Copyright 2020-2024 Record Replay Inc. */

import fs from "fs";

export function resetDirectory(path: string) {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
  }

  fs.mkdirSync(path, { recursive: true });
}
