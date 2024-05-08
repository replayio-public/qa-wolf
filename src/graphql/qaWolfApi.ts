/* Copyright 2020-2024 Record Replay Inc. */

import { GraphQLClient } from "graphql-request";
import { QAWolfApiKey, QAWolfGraphQLEndpoint } from "../config";

export const QAWolfApi = new GraphQLClient(QAWolfGraphQLEndpoint, {
  headers: { authorization: QAWolfApiKey },
});
