# `@aviation/context`

A WinterCG-compatible context utility

## Installation

```sh
npm install @aviation/context
```

## Usage

`@aviation/context` allows you to easily pass a value through to child code without needing to directly pass a variable reference. This can be useful in a few of circumstances. For example:

- when you have a value that you frequently refer back to, potentially from various places in your application (e.g. information about the current user), or,
- when you want to be able to pass a variable through a section of code you don't have control over (e.g. through a library or framework).

Behind the scenes, `@aviation/context` uses the [`AsyncLocalStorage` API](https://github.com/wintercg/proposal-common-minimum-api/blob/main/asynclocalstorage.md). If you're not already familiar with this `AsyncLocalStorage` API, it has parallels with [React's Context API](https://react.dev/learn/passing-data-deeply-with-context), so you can think of `@aviation/context` as having similar functionality: you can, at the top of your application, define some context value, and then retrieve that value in some child component, without needing to ["prop drill"](https://react.dev/learn/passing-data-deeply-with-context#the-problem-with-passing-props).

### `@aviation/context`

#### `runWithContext(value, callback)` and `runWithContext(key, value, callback)`

The `runWithContext` function is how you set a context value with `@avaition/context`. You pass in any value you want to store and it'll be made available to the `callback` function if it calls the [`getContext`](#getcontext-and-getcontextkey) function.

If you need to namespace the context value, you can pass a `key` parameter to the `runWithContext` function which will store the context value under that key.

##### Parameters

- `key`: (optional), a `symbol`
- `value`: anything
- `callback`: a `Function` — it can be asynchronous! — which accepts no parameters and returns anything

##### Return value

`runWithContext(value, callback)` and `runWithContext(key, value, callback)` return whatever the `callback` function returns.

#### `getContext()` and `getContext(key)`

If you used a `key` parameter when you called `runWithContext`, you'll want to pass that same key parameter to `getContext` in order to retrieve that context value.

##### Parameters

- `key`: (optional), a `symbol`

##### Return value

The `value` parameter you gave to `runWithContext(value, callback)` or `runWithContext(key, value, callback)`.

### Security

Note, this library makes no attempt to restrict access to context values (stored with a key or otherwise). If you have malicious code running in your application, you should assume it has access any context values.

### Examples

#### Store information about the currently logged in user with Cloudflare Workers

```ts
import { runWithContext, getContext } from "@aviation/context";

interface User {
	id: number;
	name: string;
}

export default {
	async fetch(request, environment, executionContext) {
		const user: User = await getUser(request.headers.get("Cookie"));

		return runWithContext(user, () => {
			// do lots of other stuff
			const user = getContext<User>();
			return new Response(`Hi ${user.name}!`);
		});
	},
};
```

#### Chain together multiple contexts with Cloudflare Workers

```ts
import { runWithContext, getContext } from "@aviation/context";
import { Toucan } from "toucan-js";

// a Sentry client for Cloudflare Workers

interface User {
	id: number;
	name: string;
}

const sentryContext = Symbol("sentry");
const userContext = Symbol("user");

export default {
	async fetch(request, environment, executionContext) {
		const sentry = new Toucan({ dsn: environment.SENTRY_DSN });

		return runWithContext(sentryContext, sentry, async () => {
			const user: User = await getUser(request.headers.get("Cookie"));

			return runWithContext(userContext, user, () => {
				// do lots of other stuff
				const user = getContext<User>(userContext);

				try {
					throw new Error("an unexpected error! :(");

					return new Response(`Hi ${user.name}`);
				} catch (thrown) {
					const sentry = getContext<Toucan>(sentryContext);
					sentry.setUser({ id: user.id });
					sentry.captureException(thrown);

					return new Response("Something went wrong.", { status: 500 });
				}
			});
		});
	},
};
```

#### Use `Symbol.for(key)` to reference a context by a well-known string rather than with a single shared symbol instance

```ts
// entrypoint.ts
import { runWithContext } from "@aviation/context";
import { doStuff } from "./other-file.js";

interface User {
	id: number;
	name: string;
}

export default {
	async fetch(request, environment, executionContext) {
		const user: User = await getUser(request.headers.get("Cookie"));

		return runWithContext(Symbol.for("user"), user, doStuff);
	},
};

// other-file.ts
import { getContext } from "@aviation/context";

export const doStuff = () => {
	const user = getContext<User>(Symbol.for("user"));
	return new Response(`Hi ${user.name}!`);
};
```
