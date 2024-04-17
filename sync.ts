/* Copyright 2020-2024 Record Replay Inc. */

import fs from "fs";
import path from "path";
import snakeCase from "lodash/snakeCase";
import { queryApi } from "./queryApi";

interface Workflow {
  id: string;
  name: string;
  steps: {
    id: string;
    index: number;
    stepOnBranch: {
      id: string;
      name: string;
      codeDenormalized: string;
    };
  }[];
  workflow: {
    status: string;
    name: string;
  };
}

const workflowsListPageQuery = `
query workflowsListPage($teamId: String!, $branchId: String) {
  groups(
    orderBy: {name: asc}
    where: {team_id: {equals: $teamId}, deleted_at: {equals: null}}
  ) {
    id
    name
    priority
    updated_at
    
  }
  teamBranches(where: {teamId: {equals: $teamId}}) {
    id
    environments(where: {deletedAt: {equals: null}}) {
      id
      name
      
    }
    
  }
  workflowOnBranches(
    where: {branchId: {equals: $branchId}, workflow: {is: {deleted_at: {equals: null}}}}
  ) {
    id
    workflowId
    stepOnBranchInWorkflowOnBranch {
      id
      createdAt
      index
      stepOnBranch {
        id
        stepId
        name
        codeDenormalized
        step {
          id
          isUtility
          
        }
        
      }
      
    }
    workflow {
      affectingIssues: deprecated_affectingIssues {
        id
        isActive
        isBlocking
        issueId
        issue {
          affectedEnvironments {
            branchId
            
          }
          id
          name
          reportedSuiteId
          status
          type
          
        }
        
      }
      id
      description
      name
      status
      status_updated_at
      tags {
        color
        id
        name
        updated_at
        
      }
      tasks {
        completedAt
        dueAtString
        id
        type
        
      }
      updated_at
      group_id
    }
  }
}
`;

async function queryTests(): Promise<Workflow[]> {
  const response = await queryApi("workflowsListPage", workflowsListPageQuery, {
    branchId: process.env.BRANCH_ID,
    teamId: process.env.QAWOLF_TEAM_ID,
  });

  const body = await response.text();
  try {
    return JSON.parse(body).data.workflowOnBranches.map(
      (workflowOnBranch: any) => {
        return {
          ...workflowOnBranch,
          steps: workflowOnBranch.stepOnBranchInWorkflowOnBranch,
        };
      }
    );
  } catch (e) {
    console.error(body);

    throw e;
  }
}

export default async function main() {
  const testsPath = path.join(__dirname, "src/tests");
  if (fs.existsSync(testsPath)) {
    fs.rmSync(testsPath, { recursive: true, force: true });
  }

  fs.mkdirSync(testsPath, { recursive: true });

  fs.copyFileSync(
    path.join(__dirname, "getInbox.js"),
    path.join(__dirname, "src", "getInbox.js")
  );

  const tests = await queryTests();
  const testTemplate = fs
    .readFileSync(path.join(__dirname, "qa_wolf.template.js"))
    .toString();

  const promises = tests
    .filter((t) => t.workflow.status === "active")
    .map(async (test) => {
      if (test.name === "builder.ai: Create Airbnb Buildcard") {
        return null;
      }

      const helperCode =
        test.steps.find((s) => s.stepOnBranch.name === "Helpers")?.stepOnBranch
          .codeDenormalized ?? "";

      const testCode = test.steps
        .filter(
          (s) => !["Helpers", "Upload Replay"].includes(s.stepOnBranch.name)
        )
        .sort((a, b) => a.index - b.index)
        .map((t) => `{\n${t.stepOnBranch.codeDenormalized}\n}`)
        .join("\n");

      const testName = test.workflow.name;
      const generatedTest = testTemplate
        .replace("/*REPLACE_NAME*/", testName)
        .replace("/*REPLACE_HELPER_CODE*/", helperCode)
        .replace("/*REPLACE_TEST_CODE*/", testCode);
      fs.writeFileSync(
        path.join(__dirname, `src/tests/${snakeCase(testName)}.test.js`),
        generatedTest
      );
    });

  await Promise.all(promises);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
