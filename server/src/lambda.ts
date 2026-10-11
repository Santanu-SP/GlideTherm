/**
 * GlideTherm Lambda handler.
 *
 * Uses @vendia/serverless-express to wrap the existing Express application
 * for API Gateway HTTP API (payload format v2.0).
 *
 * The same business logic, routes, and services that run locally also run
 * here — no duplicate implementations.
 */

import { createRequire } from 'node:module';
import { app } from './app.js';

const require = createRequire(import.meta.url);
// @vendia/serverless-express is CJS; we require it and call configure()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serverlessExpressCjs = require('@vendia/serverless-express') as any;

// The CJS module exports a configure function directly or via .configure
const configureFn =
  typeof serverlessExpressCjs === 'function'
    ? serverlessExpressCjs
    : serverlessExpressCjs.configure ?? serverlessExpressCjs.default;

export const handler = configureFn({ app });
