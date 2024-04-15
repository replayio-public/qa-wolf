/* Copyright 2020-2024 Record Replay Inc. */

import fetch from "node-fetch";

export async function queryApi(
  operationName: string,
  query: string,
  variables = {}
) {
  console.log("Querying API", operationName, process.env.QAWOLF_API_KEY);
  return await fetch("https://app.qawolf.com/api/graphql", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: process.env.QAWOLF_API_KEY,
    },

    body: JSON.stringify({
      operationName,
      query,
      variables,
    }),
  });
}
