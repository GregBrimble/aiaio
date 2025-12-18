import getGlobalThis from "./getGlobalThis.js";
import {
	ContextNotSetError,
	__unstable_contextSymbol,
	__unstable_defaultAsyncLocalStorageSymbol,
	getContext,
	runWithContext,
} from "./index.js";
import { AsyncLocalStorage } from "node:async_hooks";
import { type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { assert, beforeEach, describe, it, vi } from "vitest";

function objectHasContexts<T = unknown>(
	object: T,
): object is T & {
	[__unstable_contextSymbol]: Record<
		string | symbol,
		AsyncLocalStorage<unknown>
	>;
} {
	return Object.getOwnPropertySymbols(object).includes(
		__unstable_contextSymbol,
	);
}

function getContextsFromObject(
	object: unknown,
): Record<string | symbol, AsyncLocalStorage<unknown>> {
	if (!objectHasContexts(object)) {
		throw new Error(
			`\`@aviation/context\` symbol was not found on object ${String(object)}`,
		);
	}

	return object[__unstable_contextSymbol];
}

function contextsHasContext<K extends string | symbol>(
	contexts: Record<string | symbol, AsyncLocalStorage<unknown>>,
	key: K,
): contexts is { [key in K]: AsyncLocalStorage<unknown> } {
	return (
		[
			...Object.getOwnPropertyNames(contexts),
			...Object.getOwnPropertySymbols(contexts),
		].includes(key) && contexts[key] instanceof AsyncLocalStorage
	);
}

function getContextFromContexts<T = unknown>(
	contexts: Record<string | symbol, AsyncLocalStorage<T>>,
	key: string | symbol,
): unknown {
	if (!contextsHasContext(contexts, key)) {
		throw new Error(`${key.toString()} \`@aviation/context\` has not been set`);
	}

	const asyncLocalStorage = contexts[key];
	assert(asyncLocalStorage instanceof AsyncLocalStorage);

	return asyncLocalStorage.getStore();
}

async function sortPromises(
	promises: Promise<number>[],
): Promise<Promise<number>[]> {
	const results: [number, Promise<number>][] = await Promise.all(
		promises.map(async (promise) => [await promise, promise]),
	);
	const sortedResults = results.sort(([valueA], [valueB]) => valueA - valueB);
	return sortedResults.map(([, promise]) => promise);
}

vi.mock("./getGlobalThis.js");

describe("@aviation/context", () => {
	let mockedGlobalThis: typeof globalThis;

	beforeEach(() => {
		mockedGlobalThis = { mocked: true } as unknown as typeof globalThis;
		vi.mocked(getGlobalThis).mockReturnValue(mockedGlobalThis);
	});

	function getContextManually(
		key: string | symbol = __unstable_defaultAsyncLocalStorageSymbol,
	) {
		const contexts = getContextsFromObject(mockedGlobalThis);
		return getContextFromContexts(contexts, key);
	}

	describe("default context", () => {
		for (const [name, getter] of Object.entries({
			"getting context manually": getContextManually,
			"getContext() proper": getContext,
		})) {
			describe(name, () => {
				it("basic context value", ({ expect }) => {
					const value = Symbol("value");

					runWithContext(value, () => {
						expect(getter()).toEqual(value);
					});
				});

				it("context doesn't leak across children", async ({ expect }) => {
					// set a -- get a -- set b -- get b -- get a
					const { resolve: resolveExitedB, promise: exitedB } =
						Promise.withResolvers();

					const valueA = Symbol("value-a");
					const valueB = Symbol("value-b");

					await runWithContext(valueA, async () => {
						expect(getter()).toEqual(valueA);

						runWithContext(valueB, () => {
							expect(getter()).toEqual(valueB);
							resolveExitedB(null);
						});

						await exitedB;
						expect(getter()).toEqual(valueA);
					});
				});

				it("context doesn't leak across siblings", async ({ expect }) => {
					// set a ------------------------------ get a
					// ----------- set b ------ get b -----------

					const { resolve: resolveEnteredA, promise: enteredA } =
						Promise.withResolvers<number>();
					const { resolve: resolveExitedA, promise: exitedA } =
						Promise.withResolvers<number>();
					const { resolve: resolveEnteredB, promise: enteredB } =
						Promise.withResolvers<number>();
					const { resolve: resolveExitedB, promise: exitedB } =
						Promise.withResolvers<number>();

					const valueA = Symbol("value-a");
					const valueB = Symbol("value-b");

					void runWithContext(valueA, async () => {
						resolveEnteredA(performance.now());
						await exitedB;

						expect(getter()).toEqual(valueA);

						resolveExitedA(performance.now());
					});

					await enteredA;

					runWithContext(valueB, () => {
						resolveEnteredB(performance.now());

						expect(getter()).toEqual(valueB);

						resolveExitedB(performance.now());
					});

					expect(
						await sortPromises([enteredA, exitedA, enteredB, exitedB]),
					).toEqual([enteredA, enteredB, exitedB, exitedA]);

					// set c -------------- get c --------------
					// --------- set d -------------- get d ----

					const { resolve: resolveEnteredC, promise: enteredC } =
						Promise.withResolvers<number>();
					const { resolve: resolveExitedC, promise: exitedC } =
						Promise.withResolvers<number>();
					const { resolve: resolveEnteredD, promise: enteredD } =
						Promise.withResolvers<number>();
					const { resolve: resolveExitedD, promise: exitedD } =
						Promise.withResolvers<number>();

					const valueC = Symbol("value-c");
					const valueD = Symbol("value-d");

					void runWithContext(valueC, async () => {
						resolveEnteredC(performance.now());
						await enteredD;

						expect(getter()).toEqual(valueC);

						resolveExitedC(performance.now());
					});

					await enteredC;

					await runWithContext(valueD, async () => {
						resolveEnteredD(performance.now());
						await exitedC;

						expect(getter()).toEqual(valueD);

						resolveExitedD(performance.now());
					});

					expect(
						await sortPromises([enteredC, exitedC, enteredD, exitedD]),
					).toEqual([enteredC, enteredD, exitedC, exitedD]);
				});
			});
		}

		describe("runWithContext(value, callback)", () => {
			it("sets contexts and a default AsyncLocalStorage", ({ expect }) => {
				runWithContext(undefined, () => {
					const contexts = getContextsFromObject(mockedGlobalThis);
					expect(
						contextsHasContext(
							contexts,
							__unstable_defaultAsyncLocalStorageSymbol,
						),
					).toBeTruthy();
				});
			});

			it("does not leak the context value out of the callback", ({
				expect,
			}) => {
				const value = Symbol("value");

				runWithContext(value, () => {});

				expect(getContextManually()).toBeUndefined();
			});
		});

		describe("getContext()", () => {
			it("returns the default context value set by `runWithContext(value, callback)`", ({
				expect,
			}) => {
				const value = Symbol("value");

				runWithContext(value, () => {
					expect(getContext()).toEqual(value);
				});
			});

			it("throws an error when invoked outside of a context", ({ expect }) => {
				expect(() => getContext()).toThrow(ContextNotSetError);
				expect(() => getContext()).toThrowErrorMatchingInlineSnapshot(
					`[ContextNotSetError: \`getContext()\` was called outside of \`runWithContext(value, callback)\`]`,
				);
			});
		});
	});

	describe("runWithContext(key, value, callback)", () => {
		it("sets an AsyncLocalStorage for that key", ({ expect }) => {
			const context = Symbol("key");

			runWithContext(context, undefined, () => {
				const contexts = getContextsFromObject(mockedGlobalThis);
				expect(contextsHasContext(contexts, context)).toBeTruthy();
				expect(
					contextsHasContext(
						contexts,
						__unstable_defaultAsyncLocalStorageSymbol,
					),
				).toBeTruthy();
			});
		});

		it("nests with other values and contexts", async ({ expect }) => {
			// set default -- get default ----------- get default -------------------- get default ----------- get default
			// ----------------------------- set a ----------------- get a -- set b ----------------- get b --------------
			const { resolve: resolveExitedB, promise: exitedB } =
				Promise.withResolvers();

			const valueContextDefault = Symbol("value-default");
			const nestedContext = Symbol("nested-context");
			const valueA = Symbol("value-a");
			const valueB = Symbol("value-b");

			await runWithContext(valueContextDefault, async () => {
				expect(
					getContextManually(__unstable_defaultAsyncLocalStorageSymbol),
				).toEqual(valueContextDefault);

				await runWithContext(nestedContext, valueA, async () => {
					expect(
						getContextManually(__unstable_defaultAsyncLocalStorageSymbol),
					).toEqual(valueContextDefault);
					expect(getContextManually(nestedContext)).toEqual(valueA);

					runWithContext(nestedContext, valueB, () => {
						expect(
							getContextManually(__unstable_defaultAsyncLocalStorageSymbol),
						).toEqual(valueContextDefault);
						expect(getContextManually(nestedContext)).toEqual(valueB);

						resolveExitedB(null);
					});

					await exitedB;

					expect(
						getContextManually(__unstable_defaultAsyncLocalStorageSymbol),
					).toEqual(valueContextDefault);
					expect(getContextManually(nestedContext)).toEqual(valueA);
				});
			});
		});
	});

	describe("getContext(key)", () => {
		it("returns the key'd context value set by `runWithContext(key, value, callback)`", ({
			expect,
		}) => {
			const context = Symbol("key");
			const value = Symbol("value");

			runWithContext(context, value, () => {
				expect(getContext(context)).toEqual(value);
				expect(getContext()).not.toEqual(value);
			});
		});

		it("throws an error when invoked outside of a context", ({ expect }) => {
			const context = Symbol("key");

			expect(() => getContext(context)).toThrow(ContextNotSetError);
			expect(() => getContext(context)).toThrowErrorMatchingInlineSnapshot(
				`[ContextNotSetError: \`getContext(key)\` was called outside of \`runWithContext(key, value, callback)\`]`,
			);
		});

		it("works with Symbol.for(key)", ({ expect }) => {
			const value = Symbol("value");

			runWithContext(Symbol.for("key"), value, () => {
				expect(getContext(Symbol.for("key"))).toEqual(value);
			});
		});
	});

	describe("in a React render", () => {
		it("context can be passed from outside React", ({ expect }) => {
			const Component = () => {
				return <p>{getContext()}</p>;
			};

			expect(
				runWithContext("Value from platform", () =>
					renderToString(<Component />),
				),
			).toMatchInlineSnapshot(`"<p>Value from platform</p>"`);
		});

		it("context passes through to children from parents when using render props", ({
			expect,
		}) => {
			const ChildComponent = () => {
				return <p>{getContext()}</p>;
			};

			const ParentComponent = ({ render }: { render: () => ReactNode }) => {
				const value = "Set from parent";

				return runWithContext(value, render);
			};

			expect(
				renderToString(<ParentComponent render={ChildComponent} />),
			).toMatchInlineSnapshot(`"<p>Set from parent</p>"`);
		});

		it("children can manipulate their parent's context when rendering", ({
			expect,
		}) => {
			const ChildComponent = () => {
				const context = getContext<{ value: string }>();
				context.value = "New value";

				return <p>Child rendered</p>;
			};

			const ParentComponent = () => {
				const context = { value: "Default value" };

				const children = runWithContext(context, ChildComponent);

				return (
					<>
						{context.value}
						{children}
					</>
				);
			};

			expect(renderToString(<ParentComponent />)).toMatchInlineSnapshot(
				`"New value<p>Child rendered</p>"`,
			);
		});
	});
});
