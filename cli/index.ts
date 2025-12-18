import packageJson from "../lib/@aiaio/internal/packageJson.ts";
import { Command } from "@effect/cli";
import { Console } from "effect";

const command = Command.make(packageJson.name, {}, () =>
	Console.log("Build something great."),
);

export const cli = Command.run(command, {
	name: packageJson.title,
	version: `v${packageJson.version}`,
});
