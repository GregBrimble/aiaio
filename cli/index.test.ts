import packageJson from "../package.json" with { type: "json" };
import { command } from "./index.ts";
import { NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { TestConsole } from "effect/testing";
import { CliOutput, Command } from "effect/unstable/cli";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const TestLayer = Layer.mergeAll(
	TestConsole.layer,
	CliOutput.layer(CliOutput.defaultFormatter({ colors: false })),
	NodeServices.layer,
);

const run = Command.runWith(command, { version: packageJson.version });

describe("command", () => {
	it("outputs the version with the --version flag", async () => {
		const output = await Effect.gen(function* () {
			yield* run(["--version"]);
			return yield* TestConsole.logLines;
		}).pipe(Effect.provide(TestLayer), Effect.runPromise);

		const stdout = output.map(String).join("\n");
		expect(stdout).toMatch(/\d+\.\d+\.\d+/);
	});

	it("renders a help menu with the --help flag", async () => {
		const output = await Effect.gen(function* () {
			yield* run(["--help"]);
			return yield* TestConsole.logLines;
		}).pipe(Effect.provide(TestLayer), Effect.runPromise);

		const stdout = output.map(String).join("\n");
		expect(stdout).toContain(packageJson.name);
		expect(stdout).toContain("USAGE");
	});

	it("reports errors for an invalid flag", async () => {
		const { stdout, stderr } = await Effect.gen(function* () {
			yield* run(["--invalid-flag"]);
			const stdout = yield* TestConsole.logLines;
			const stderr = yield* TestConsole.errorLines;
			return { stdout, stderr };
		}).pipe(Effect.provide(TestLayer), Effect.runPromise);

		expect(stdout.map(String).join("\n")).toContain("USAGE");
		expect(stderr.map(String).join("\n")).toContain(
			"Unrecognized flag: --invalid-flag",
		);
	});
});

it("boots as a CLI", async () => {
	const { stdout, stderr, code } = await new Promise<{
		stdout: string;
		stderr: string;
		code: number | null;
	}>((resolvePromise, reject) => {
		const cli = spawn(process.execPath, [
			resolve(import.meta.dirname, "./bin/index.ts"),
			"--version",
		]);

		let stdout = "";
		let stderr = "";

		cli.stdin.end();
		cli.stdout.on("data", (data) => {
			stdout += String(data);
		});
		cli.stderr.on("data", (data) => {
			stderr += String(data);
		});
		cli.on("close", (code) => {
			resolvePromise({ stdout, stderr, code });
		});
		cli.on("error", reject);
	});

	expect(code).toBe(0);
	expect(stderr).toBe("");
	expect(stdout).toMatch(/\d+\.\d+\.\d+/);
});
