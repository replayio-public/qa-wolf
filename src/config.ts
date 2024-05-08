/* Copyright 2020-2024 Record Replay Inc. */

import { randomUUID } from "crypto";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: [".env.local"] });

export const TestsDirectory = path.join(__dirname, "generated_tests");
export const QAWolfGraphQLEndpoint = "https://app.qawolf.com/api/graphql";
export const QAWolfBranchId = process.env.BRANCH_ID;
export const QAWolfTeamId = process.env.QAWOLF_TEAM_ID;
export const QAWolfApiKey = process.env.QAWOLF_API_KEY;
export const QAWolfEnvironmentId = process.env.QAWOLF_ENVIRONMENT_ID;
export const QAWolfRunId =
  process.env.QAWOLF_RUN_ID || `qawolf-${Date.now()}-${randomUUID()}`;
export const ReplayApiKey = process.env.REPLAY_API_KEY;
