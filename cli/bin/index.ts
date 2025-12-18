#!/usr/bin/env node

import { cli } from "../index.ts";
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Effect } from "effect";

cli.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
