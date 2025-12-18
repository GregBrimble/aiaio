// Browser stub for @aviation/context
// This module should never be called in the browser - it's only used on the server.
// If you see errors from this file, it means server-only code is being bundled for the client.

export const __unstable_contextSymbol = Symbol("@aviation/context");
export const __unstable_defaultAsyncLocalStorageSymbol = Symbol(
	"@aviation/context:default",
);

export class ContextNotSetError extends Error {
	constructor(named: boolean) {
		super(
			`\`${
				named ? "getContext(key)" : "getContext()"
			}\` was called outside of \`${
				named
					? "runWithContext(key, value, callback)"
					: "runWithContext(value, callback)"
			}\``,
		);
		this.name = "ContextNotSetError";
	}
}

type Callback<T> = () => T;

export function runWithContext<T>(value: unknown, callback: Callback<T>): T;
export function runWithContext<T>(
	key: symbol,
	value: unknown,
	callback: Callback<T>,
): T;
export function runWithContext<T>(
	// @ts-expect-error Unused parameter
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	...args: [unknown, Callback<T>] | [symbol, unknown, Callback<T>]
) {
	throw new Error(
		"@aviation/context runWithContext() cannot be called in the browser. " +
			"This is server-only code that should not be bundled for the client.",
	);
}

// @ts-expect-error Unused parameter
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unnecessary-type-parameters
export function getContext<T = unknown>(key?: symbol): T {
	throw new Error(
		"@aviation/context getContext() cannot be called in the browser. " +
			"This is server-only code that should not be bundled for the client.",
	);
}
