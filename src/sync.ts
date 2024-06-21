/* Copyright 2020-2024 Record Replay Inc. */

import fs from "fs";
import execa from "execa";
import path from "path";
import snakeCase from "lodash/snakeCase";
import { resetDirectory } from "./utils";
import { TestsDirectory } from "./config";
import { getWorkflowsListPages } from "./graphql/workflowsListPageQuery";

export async function downloadAndSaveQAWolfTests() {
  resetDirectory(TestsDirectory);

  const tests = await getWorkflowsListPages();
  const testTemplate = fs
    .readFileSync(path.join(__dirname, "qa_wolf.template.js"))
    .toString();

  return tests.workflowsOnBranch
    .filter((t) => t.workflow.status === "active")
    .map((test) => {
      const helperCode =
        test.stepOnBranchInWorkflowOnBranch
          .find((s) => s.stepOnBranch.name === "Node 20 Helpers")
          ?.stepOnBranch.codeDenormalized.replaceAll(
            `const $ = execa`,
            `const $ = (await dynamicImport("execa").then((module) => module.execa))`,
          ) ?? "";

      const testCode = test.stepOnBranchInWorkflowOnBranch
        .filter(
          (s) => !["Helpers", "Upload Replay"].includes(s.stepOnBranch.name),
        )
        .sort((a, b) => a.index - b.index)
        .map((t) => `{\n${t.stepOnBranch.codeDenormalized}\n}`)
        .join("\n")
        .replaceAll(
          `const $ = execa`,
          `const $ = (await dynamicImport("execa").then((module) => module.execa))`,
        );

      const testName = test.workflow.name;
      const generatedTest = testTemplate
        .replace("/*REPLACE_NAME*/", () => testName)
        .replace("/*REPLACE_HELPER_CODE*/", () => helperCode)
        .replace("/*REPLACE_TEST_CODE*/", () => testCode);

      fs.writeFileSync(
        path.join(TestsDirectory, `${snakeCase(testName)}.test.js`),
        generatedTest,
      );
    });
}

if (require.main === module) {
  downloadAndSaveQAWolfTests()
    .then(() => process.exit(0))
    .catch((e) => {
      console.log(`Error syncing tests`, e);
      process.exit(1);
    });
}
