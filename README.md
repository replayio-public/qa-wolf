## QA Wolf Runner

The QA Wolf Runner is written and maintained by the Replay.io team to make it easy to run the QA Wolf tests on our Mac infrastructure.

### Usage

1. `node buildkite.js` to install dependencies and run the QA Wolf tests
2. `node run.js` to run the QA Wolf tests directly

### Environment Variables

- `QAWOLF_ENVIRONMENT_ID` - The ID of the QA Wolf environment to run the tests against
- `QAWOLF_TEAM_ID` - The ID of the QA Wolf team to run the tests against
- `QAWOLF_API_KEY` - The API key for the QA Wolf team to run the tests against
- `REPLAY_API_KEY` - The API key for the Replay.io team to upload the recordings to
- `BUILDKITE_BUILD_CHECKOUT_PATH` - The ci checkout path for the buildkite build (not required if running locally)

> Note: If you don't include the `REPLAY_API_KEY` environment variable, the QA Wolf tests will not upload recordings to Replay.io.
