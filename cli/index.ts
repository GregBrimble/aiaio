import packageJson from "../lib/@aiaio/internal/packageJson.ts";
import { Console } from "effect";
import { Command } from "effect/unstable/cli";

export const command = Command.make(packageJson.name, {}, () =>
	Console.log("Build something great."),
);

export const cli = Command.run(command, { version: packageJson.version });
