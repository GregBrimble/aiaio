import packageJson from "../package.json" with { type: "json" };
import * as Ansi from "@effect/printer-ansi/Ansi";
import * as Doc from "@effect/printer-ansi/AnsiDoc";
import ansiEscapes from "ansi-escapes";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const assertWizardExited = (stdout: string) => {
	expect(stdout).toContain(
		Doc.annotate(Doc.text("✔"), Ansi.green).pipe(
			Doc.render({ style: "pretty" }),
		),
	);
	expect(stdout).toContain(
		Doc.annotate(
			Doc.text("no"),
			Ansi.combine(Ansi.underlined, Ansi.white),
		).pipe(Doc.render({ style: "pretty" })),
	);
};

const runCLI = (
	args: string[],
	interactions: Array<{
		waitFor: string | RegExp;
		callback: ({
			stdout,
			stderr,
		}: {
			stdout: string;
			stderr: string;
		}) => string;
	}> = [],
): Promise<{ stdout: string; stderr: string; code: number | null }> => {
	const {
		promise,
		resolve: resolvePromise,
		reject,
	} = Promise.withResolvers<{
		stdout: string;
		stderr: string;
		code: number | null;
	}>();

	const cli = spawn(process.execPath, [
		resolve(import.meta.dirname, "./bin/index.ts"),
		...args,
	]);

	let stdout = "";
	let stderr = "";
	let currentInteractionIndex = 0;

	if (interactions.length === 0) {
		cli.stdin.end();
	}

	cli.stdout.on("data", (data) => {
		stdout += String(data);

		const currentInteraction = interactions[currentInteractionIndex];
		if (currentInteraction) {
			const { waitFor } = currentInteraction;
			const matched = stdout.match(new RegExp(waitFor)) !== null;

			if (matched) {
				cli.stdin.write(currentInteraction.callback({ stdout, stderr }));
				currentInteractionIndex++;

				if (currentInteractionIndex >= interactions.length) {
					cli.stdin.end();
				}
			}
		}
	});

	cli.stderr.on("data", (data) => {
		stderr += String(data);
	});

	cli.on("close", (code) => {
		if (currentInteractionIndex < interactions.length) {
			const unusedInteractions = interactions.slice(currentInteractionIndex);
			const unusedWaitFors = unusedInteractions
				.map((i) =>
					typeof i.waitFor === "string"
						? JSON.stringify(i.waitFor)
						: i.waitFor.toString(),
				)
				.join(", ");
			reject(
				new Error(
					`Test error: ${String(unusedInteractions.length)} interaction(s) never triggered. Expected to find: ${unusedWaitFors}`,
				),
			);
			return;
		}

		resolvePromise({ stdout, stderr, code });
	});

	cli.on("error", reject);

	return promise;
};

describe("runCLI", () => {
	describe("interactivity", () => {
		it("can wait for strings", async () => {
			const { stdout, stderr, code } = await runCLI(
				["--wizard"],
				[
					{
						waitFor: "Would you like to run the command?",
						callback: () => ansiEscapes.cursorForward(1) + "\n", // Right arrow to select "no", then Enter
					},
				],
			);
			expect(code).toBe(0);
			expect(stderr).toBe("");
			expect(stdout).toContain("Wizard Mode");
			expect(stdout).toContain("Would you like to run the command?");
			assertWizardExited(stdout);
		});

		it("can wait for regular expressions", async () => {
			const { stdout, stderr, code } = await runCLI(
				["--wizard"],
				[
					{
						waitFor: /Would you like to run the command\?/,
						callback: () => ansiEscapes.cursorForward(1) + "\n", // Right arrow to select "no", then Enter
					},
				],
			);
			expect(code).toBe(0);
			expect(stderr).toBe("");
			expect(stdout).toContain("Wizard Mode");
			expect(stdout).toContain("Would you like to run the command?");
			assertWizardExited(stdout);
		});

		it("throws for unconsumed interactions", async () => {
			await expect(
				runCLI(
					["--version"],
					[
						{
							waitFor: "This text will never appear",
							callback: () => "\n",
						},
						{
							waitFor: /This .* will never appear/i,
							callback: () => "\n",
						},
					],
				),
			).rejects.toThrow(
				'Test error: 2 interaction(s) never triggered. Expected to find: "This text will never appear", /This .* will never appear/i',
			);
		});
	});
});

describe("CLI", () => {
	it("outputs the version with the --version flag", async () => {
		const { stdout, stderr, code } = await runCLI(["--version"]);
		expect(code).toBe(0);
		expect(stderr).toBe("");
		expect(stdout).toMatch(/v\d+\.\d+\.\d+/);
	});

	it("renders a help menu with the --help flag", async () => {
		const { stdout, stderr, code } = await runCLI(["--help"]);
		expect(code).toBe(0);
		expect(stderr).toBe("");
		expect(stdout).toContain(packageJson.title);
		expect(stdout).toContain("USAGE");
	});

	it("errors for an invalid argument", async () => {
		const { code, stderr } = await runCLI(["invalid-argument"]);
		expect(code).not.toBe(0);
		expect(stderr).toMatchInlineSnapshot(`
			"Received unknown argument: 'invalid-argument'

			"
		`);
	});

	it("errors for an invalid flag", async () => {
		const { code, stderr } = await runCLI(["--invalid-flag"]);
		expect(code).not.toBe(0);
		expect(stderr).toMatchInlineSnapshot(`
			"Received unknown argument: '--invalid-flag'

			"
		`);
	});

	it("cancels wizard execution when user selects no", async () => {
		const { stdout, stderr, code } = await runCLI(
			["--wizard"],
			[
				{
					waitFor: "Would you like to run the command?",
					callback: () => ansiEscapes.cursorForward(1) + "\n", // Right arrow to select "no", then Enter
				},
			],
		);
		expect(code).toBe(0);
		expect(stderr).toBe("");
		expect(stdout).toContain("Wizard Mode");
		expect(stdout).toContain("Would you like to run the command?");
		assertWizardExited(stdout);
	});
});
