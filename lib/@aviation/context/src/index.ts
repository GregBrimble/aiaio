import getGlobalThis from "./getGlobalThis.js";
import { AsyncLocalStorage } from "node:async_hooks";

const contextSymbol = Symbol("@aviation/context");
const defaultAsyncLocalStorageSymbol = Symbol("@aviation/context:default");
export {
	contextSymbol as __unstable_contextSymbol,
	defaultAsyncLocalStorageSymbol as __unstable_defaultAsyncLocalStorageSymbol,
};

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

type Contexts<T> = Record<symbol, AsyncLocalStorage<T>>;

type GlobalThisWithContexts<T> = typeof globalThis & {
	[contextSymbol]: Contexts<T>;
};

function getContexts<T>() {
	return (getGlobalThis() as Partial<GlobalThisWithContexts<T>>)[contextSymbol];
}

function getOrCreateContexts<T>() {
	try {
		Object.defineProperty(getGlobalThis(), contextSymbol, {
			configurable: false,
			enumerable: false,
			value: {
				[defaultAsyncLocalStorageSymbol]: new AsyncLocalStorage(),
			},
			writable: false,
		});
	} catch (error) {
		if (!(error instanceof TypeError)) {
			throw error;
		}
	}

	return getContexts<T>() as Contexts<T>;
}

type Callback<T> = () => T;

function runWithContextArgsAreDefault<T>(
	args: [unknown, Callback<T>] | [symbol, unknown, Callback<T>],
): args is [unknown, Callback<T>] {
	return args.length === 2;
}

export function runWithContext<T>(value: unknown, callback: Callback<T>): T;
export function runWithContext<T>(
	key: symbol,
	value: unknown,
	callback: Callback<T>,
): T;
export function runWithContext<T>(
	...args: [unknown, Callback<T>] | [symbol, unknown, Callback<T>]
) {
	let key: symbol = defaultAsyncLocalStorageSymbol;
	let value: unknown;
	let callback: Callback<T>;

	if (runWithContextArgsAreDefault(args)) {
		[value, callback] = args;
	} else {
		[key, value, callback] = args;
	}

	const contexts = getOrCreateContexts();
	const asyncLocalStorage = contexts[key] ?? new AsyncLocalStorage();

	if (contexts[key] === undefined) {
		contexts[key] = asyncLocalStorage;
	}

	return asyncLocalStorage.run(value, callback);
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function getContext<T = unknown>(key?: symbol): T {
	key = key ?? defaultAsyncLocalStorageSymbol;

	const contexts = getContexts<T>();
	if (contexts === undefined) {
		throw new ContextNotSetError(key !== defaultAsyncLocalStorageSymbol);
	}
	const asyncLocalStorage = contexts[key];

	if (!(asyncLocalStorage instanceof AsyncLocalStorage)) {
		throw new ContextNotSetError(key !== defaultAsyncLocalStorageSymbol);
	}

	return asyncLocalStorage.getStore() as T;
}
