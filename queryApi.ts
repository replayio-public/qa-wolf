/* Copyright 2020-2024 Record Replay Inc. */

import fetch from "node-fetch";

const Authorization = process.env.QAWOLF_API_KEY;

export async function queryApi(
  operationName: string,
  query: string,
  variables = {}
) {
  return await fetch("https://app.qawolf.com/api/graphql", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization,
    },

    body: JSON.stringify({
      operationName,
      query,
      variables,
    }),
  });
}
