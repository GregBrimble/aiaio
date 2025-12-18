import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import walk from "ignore-walk";
import micromatch from "micromatch";
import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { readdirSync } from "node:fs";
import { resolve, relative, basename, join } from "node:path";
import { vitestPluginRSC } from "vitest-plugin-rsc";
import { defineConfig, defaultInclude, defaultExclude } from "vitest/config";
import { type ProjectConfig } from "vitest/node";

// https://github.com/microsoft/TypeScript/issues/61321
declare global {
	interface RegExpConstructor {
		escape(str: string): string;
	}
}

function generateTestConfig(directory: string) {
	return {
		include: defaultInclude.map((glob) => resolve(directory, glob)),
		exclude: defaultExclude,
	} satisfies Pick<ProjectConfig, "include" | "exclude">;
}

const CLI_DIRECTORY = "./cli/";
const CLI_TESTS = generateTestConfig(CLI_DIRECTORY);

const SCRIPTS_DIRECTORY = "./scripts/";
const SCRIPTS_TESTS = generateTestConfig(SCRIPTS_DIRECTORY);

const WORKER_DIRECTORY = "./worker/";
const WORKER_TESTS = generateTestConfig(WORKER_DIRECTORY);

const REACT_DIRECTORY = "./web/";
const REACT_TESTS = generateTestConfig(REACT_DIRECTORY);

const LIBRARY_DIRECTORY = "./lib/";
const LIBRARY_TESTS = generateTestConfig(LIBRARY_DIRECTORY);

const generateGitignoreTester = async () => {
	const files = (
		await walk({
			path: __dirname,
			ignoreFiles: [".gitignore"],
			includeEmpty: true,
		})
	).filter((file) => file.startsWith(".git/"));

	return (path: string) => {
		const relativePath = relative(process.cwd(), path);
		return !files.includes(relativePath);
	};
};

let currentBuildProcess: ChildProcess | null = null;

const runBuild = () => {
	console.clear();

	if (currentBuildProcess) {
		currentBuildProcess.kill();
		currentBuildProcess = null;
	}

	let buildOutput = "";

	console.log("🔄 Building...");
	currentBuildProcess = spawn("npm", ["run", "build"], {
		stdio: ["ignore", "pipe", "pipe"],
		env: {
			...process.env,
			FORCE_COLOR: "1",
			NPM_CONFIG_COLOR: "always",
		},
	});

	currentBuildProcess.stdout?.on("data", (data) => {
		buildOutput += String(data);
	});

	currentBuildProcess.stderr?.on("data", (data) => {
		buildOutput += String(data);
	});

	currentBuildProcess.on("close", (code) => {
		console.clear();
		if (currentBuildProcess?.exitCode === null) {
			console.log("🔄 Restarting build...");
			currentBuildProcess = null;
			return;
		}
		if (code === 0) {
			console.log("✅ Build success.");
		} else if (code !== null) {
			console.error("❌ Build failed.");
			if (buildOutput) {
				console.error(buildOutput);
			}
		}
		currentBuildProcess = null;
	});
};

export default defineConfig({
	plugins: [
		{
			name: "Rebuild application on change",
			async configureServer(server) {
				let isIgnored = await generateGitignoreTester();

				const handleUpdateForUnignoredFiles = (path: string) => {
					const relativePath = relative(__dirname, path);
					if (isIgnored(relativePath)) return;

					if (
						micromatch.isMatch(
							path,
							[...REACT_TESTS.include, ...WORKER_TESTS.include],
							{
								ignore: [...REACT_TESTS.exclude, ...WORKER_TESTS.exclude],
							},
						)
					)
						return;

					runBuild();
				};

				server.watcher.add(__dirname);

				server.watcher.on("all", (_, path) => {
					const filename = basename(path);
					if (filename === ".gitignore") {
						generateGitignoreTester()
							.then((newIsIgnored) => {
								isIgnored = newIsIgnored;
								handleUpdateForUnignoredFiles(path);
							})
							.catch((e: unknown) => {
								throw e;
							});
						return;
					}

					handleUpdateForUnignoredFiles(path);
				});
			},
		},
	],
	test: {
		projects: [
			{
				test: {
					name: "CLI",
					...CLI_TESTS,
				},
			},
			{
				test: {
					name: "Scripts",
					...SCRIPTS_TESTS,
				},
			},
			{
				plugins: [react(), vitestPluginRSC()],
				test: {
					name: "React Application",
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: "chromium" }],
					},
					...REACT_TESTS,
					setupFiles: ["./web/__tests__/vitest.setup.ts"],
				},
			},
			{
				plugins: [
					cloudflareTest({
						wrangler: {
							configPath: resolve("./dist/worker/wrangler.json"),
						},
					}),
				],
				test: {
					name: "Cloudflare Worker",
					...WORKER_TESTS,
				},
			},
			{
				test: {
					name: "Library",
					...LIBRARY_TESTS,
				},
			},
		],
		watchTriggerPatterns: [
			{
				pattern: new RegExp(RegExp.escape(join(__dirname, "./dist/"))),
				testsToRun() {
					return readdirSync(WORKER_DIRECTORY, {
						encoding: "utf-8",
						recursive: true,
					})
						.map((file) => resolve(WORKER_DIRECTORY, file))
						.filter((file) =>
							micromatch.isMatch(file, WORKER_TESTS.include, {
								ignore: WORKER_TESTS.exclude,
							}),
						);
				},
			},
		],
	},
});
