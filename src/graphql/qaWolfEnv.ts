import { z } from "zod";
import { QAWolfEnvironmentId } from "../config";
import { QAWolfApi } from "./qaWolfApi";
import { spawnSync } from "child_process";

const EnvironmentQuery = `
  query environment($id: String!) {
    environment(where: {id: $id}) {
      id
      name
      variablesJSON
      variables {
        name
        value
      }
    }
  }`;

function pageSize(): number {
  return Number(spawnSync("getconf", ["PAGE_SIZE"]).stdout.toString());
}

const ZQAWolfEnvironmentVariables = z.object({
  environment: z.object({
    variables: z.array(z.object({ name: z.string(), value: z.string() })),
  }),
});

export async function getQAWolfEnvVars(): Promise<Record<string, string>> {
  const response = ZQAWolfEnvironmentVariables.parse(
    await QAWolfApi.request(EnvironmentQuery, {
      id: QAWolfEnvironmentId,
    }),
  );
  // Technically, the limit for an ENV VAR value is supposed to be something like 32 * page_size,
  // which is 4kb. For some reason it's actually slightly *less* than that, so I'm just
  // subtracting 1,000 here. When checking on a real Fly VM, subtracting 6 was enough.
  const maxEnvVarLength = 32 * pageSize() - 1000;
  console.log(
    `Longest possible environment variable length: `,
    maxEnvVarLength,
  );

  // CAREFUL! Sometimes QAWolf has environment variables that override really important env vars
  // like `RECORD_REPLAY_API_KEY`. For that reason we have to carefully filter this set of
  // environment variables.
  const filteredEnvVars = response.environment.variables.filter(
    ({ name, value }) => {
      if (value.length > maxEnvVarLength) {
        console.warn(
          `Not overriding ${name} with QAWolf Environment Variable because it is too big.`,
        );
        return false;
      }
      if (name in process.env) {
        console.warn(
          `Not overriding ${name} with QAWolf Environment Variable because it was already set.`,
        );
        return false;
      }
      return true;
    },
  );

  return Object.fromEntries(
    filteredEnvVars.map(({ name, value }) => [name, value]),
  );
}

if (require.main === module) {
  getQAWolfEnvVars()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(`Error: ${e}`);
      process.exit(1);
    });
}
