## QA Wolf Runner

The QA Wolf Runner is written and maintained by the Replay.io team to make it
easy to run the QA Wolf tests on our Mac infrastructure.

### Usage

If you just want to try and run the tests locally, then you can run the same
commands that the GitHub workflow runs. First you will want to fill in the
`.env.local` file using the values in 1Password. Then you can run:

```
pnpm install
npx replayio update
npx ts-node src/sync.ts
npx ts-node src/runPlaywright.ts
```

1. The `sync.ts` script will hit the QAWolf GraphQL API and pull down a bunch
   of playwright scripts, which it will iterate over and write to
   `src/generated_tests`.
2. The `runPlaywright.ts` script will pull down QAWolf environment
   variables (which are required to do things like login to the sites under
   test) and run the playwright browser pointed at the generated files from the
   previous step.

If you hit errors here feel free to ask for help in Replay discord, or in
QAWolf <> Replay Slack.

### Troubleshooting GraphQL

Sometimes QAWolf changes their GraphQL API, breaking these scripts. In those
cases, it can be helpful to see how their API has changed. There's a JSON file
in the project root called `qa_wolf_graphql_api_scheme.json` which can be
loaded into [GraphQL Voyager](https://graphql-kit.com/graphql-voyager/). And
instructions on that site can also be followed to get the latest schema from
the API.

### Environment Variables

- `QAWOLF_ENVIRONMENT_ID`: The ID of the QA Wolf environment to run the tests
  against.
- `QAWOLF_TEAM_ID`: The ID of the QA Wolf team to run the tests against.
- `QAWOLF_API_KEY`: The API key for the QA Wolf team to run the tests against.
- `REPLAY_API_KEY`: The API key for the Replay.io team to upload the recordings
  to.
