import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
// @ts-expect-error - @raycast/eslint-plugin doesn't provide types
import raycast from "@raycast/eslint-plugin";
import { type Linter } from "eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import assert from "node:assert";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

function assertDefined<T>(value: T | undefined) {
	assert(value);
	return value;
}

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	assertDefined(react.configs.flat.recommended),
	assertDefined(react.configs.flat["jsx-runtime"]),
	{
		settings: {
			react: {
				version: "detect",
			},
		},
	},
	reactHooks.configs.flat.recommended,
	jsxA11y.flatConfigs.strict,
	reactCompiler.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	includeIgnoreFile(gitignorePath),
	{
		files: ["./worker-configuration.d.ts"],
		linterOptions: {
			reportUnusedDisableDirectives: "off",
		},
	},
	globalIgnores(["./raycast-env.d.ts"]),
	{
		files: ["./raycast-env.d.ts", "./src/**/*"],
		...(raycast as { configs: { recommended: [Linter.Config] } }).configs
			.recommended[0],
	},
);
