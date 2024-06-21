import { QAWolfBranchId, QAWolfTeamId } from "../config";
import { QAWolfApi } from "./qaWolfApi";
import { z } from "zod";

const WorkflowOnBranches = `
query workflowsListPage($branchId: String!) {
  workflowsOnBranch(
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

const WorkflowsListPagesResponse = z.object({
  workflowsOnBranch: z.array(
    z.object({
      id: z.string(),
      workflowId: z.string(),
      stepOnBranchInWorkflowOnBranch: z.array(
        z.object({
          id: z.string(),
          index: z.number(),
          createdAt: z.string(),
          stepOnBranch: z.object({
            id: z.string(),
            stepId: z.string(),
            name: z.string(),
            codeDenormalized: z.string(),
            step: z.object({
              id: z.string(),
              isUtility: z.boolean(),
            }),
          }),
        }),
      ),
      workflow: z.object({
        id: z.string(),
        description: z.unknown(),
        group_id: z.string().nullable(),
        name: z.string(),
        status: z.string(),
        updated_at: z.string(),
        status_updated_at: z.string(),
        tags: z.array(
          z.object({
            color: z.string(),
            name: z.string(),
            id: z.string(),
            updated_at: z.string(),
          }),
        ),
        tasks: z.array(
          z.object({
            completedAt: z.string().nullable(),
            dueAtString: z.string().nullable(),
            id: z.string(),
            type: z.string(),
          }),
        ),
        affectingIssues: z.array(
          z.object({
            id: z.string(),
            isActive: z.boolean(),
            isBlocking: z.boolean(),
            issue: z.object({
              affectedEnvironments: z.array(z.object({ branchId: z.string() })),
              id: z.string(),
              name: z.string(),
              reportedSuiteId: z.string().nullable(),
              status: z.string(),
              type: z.string(),
            }),
          }),
        ),
      }),
    }),
  ),
});
type ZWorkflowsListPagesResponse = z.infer<typeof WorkflowsListPagesResponse>;

export async function getWorkflowsListPages(): Promise<ZWorkflowsListPagesResponse> {
  const response = await QAWolfApi.request(WorkflowOnBranches, {
    branchId: QAWolfBranchId,
    teamId: QAWolfTeamId,
  });
  return WorkflowsListPagesResponse.parse(response);
}
