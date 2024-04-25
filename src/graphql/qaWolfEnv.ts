import { z } from "zod";
import { QAWolfEnvironmentId } from "../config";
import { QAWolfApi } from "./qaWolfApi";

const EnvironmentQuery = `
    query environment($id: String!) {
      environment(where: {id: $id}) {
        ...EnvironmentFragment
        __typename
      }
    }
    fragment EnvironmentFragment on Environment {
      id
      name
      variablesJSON
      variables(orderBy: {name: asc}) {
        ...EnvironmentVariableFragment
        __typename
      }
      __typename
    }
    fragment EnvironmentVariableFragment on EnvironmentVariable {
      created_at
      environment_id
      id
      name
      value
      __typename
    }
    `;

const ZQAWolfEnvironmentVariables = z.object({
  environment: z.object({
    variables: z.array(z.object({ name: z.string(), value: z.string() })),
  }),
});

export async function getQAWolfEnvVars(): Promise<Record<string, string>> {
  const response = ZQAWolfEnvironmentVariables.parse(
    await QAWolfApi.request(EnvironmentQuery, {
      id: QAWolfEnvironmentId,
    })
  );

  // CAREFUL! Sometimes QAWolf has environment variables that override really important env vars
  // like `RECORD_REPLAY_API_KEY`. For that reason we have to carefully filter this set of
  // environment variables.
  const filteredEnvVars = response.environment.variables.filter(({ name }) => {
    if (name in process.env) {
      console.warn(
        `Not overriding ${name} with QAWolf Environment Variable because it was already set.`
      );
      return false;
    }
    return true;
  });

  return Object.fromEntries(
    filteredEnvVars.map(({ name, value }) => [name, value])
  );
}
