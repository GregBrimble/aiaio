#!/usr/bin/env node

import { cli } from "../index.ts";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Effect } from "effect";

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);
