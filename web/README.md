# React web application

This directory contains a React web application. It is served by the Cloudflare Worker located in `../worker/`.

## Structure

- `./__tests__/`

  Test setup for the web application.

- `./components/`

  React components which are re-used throughout the web application.

- `./framework/`

  The code which executes React on the server and in the browser.

- `./pages/`

  The URL-navigatable screens of this application.

- `./context.ts`

  AsyncLocalStorage utilities for fetching the current request, the platform's environment, and the platform's execution context in React Server Components and React Server Functions.

- `./error-boundary.tsx`

  A customizable React Client Component which is invoked in the case of fatal errors.

- `./index.css`

  The Tailwind entrypoint.

- `./root.tsx`

  The React application entrypoint.

## Tests

This application uses the `vitest-plugin-rsc` library for testing. This library is configured in `./__tests__/vitest.setup.ts`.

### Server component

<details>
<summary><code>server-counter.tsx</code></summary>

```tsx filename="server-counter.tsx"
import {
	changeServerCounter,
	getServerCounter,
	resetServerCounter,
} from "./actions.js";

export async function ServerCounter() {
	return (
		<form action={changeServerCounter}>
			<input type="hidden" name="change" value="1" />
			<button>server-counter: {await getServerCounter()}</button>
			<button formAction={resetServerCounter}>server-counter-reset</button>
		</form>
	);
}
```

</details>

<details>
<summary><code>actions.tsx</code></summary>

```ts filename="actions.ts"
/* eslint-disable @typescript-eslint/require-await */
"use server";

let serverCounter = 0;

export async function getServerCounter(): Promise<number> {
	return serverCounter;
}

export async function changeServerCounter(formData: FormData): Promise<void> {
	const TEST_UPDATE = 1;
	serverCounter += Number(formData.get("change")) * TEST_UPDATE;
}

export async function resetServerCounter(): Promise<void> {
	serverCounter = 0;
}
```

</details>

```tsx filename="server-counter.test.tsx"
import { ServerCounter } from "./server-counter.js";
import { expect, test } from "vitest";
import { renderServer } from "vitest-plugin-rsc/testing-library";
import { page } from "vitest/browser";
import { userEvent } from "vitest/browser";

test("ServerCounter", async () => {
	await renderServer(<ServerCounter />, { rerenderOnServerAction: true });

	await userEvent.click(
		page.getByRole("button", { name: "server-counter: 0" }),
	);
	await expect
		.element(page.getByRole("button", { name: "server-counter: 1" }))
		.toBeVisible();

	await userEvent.click(
		page.getByRole("button", { name: "server-counter: 1" }),
	);
	await expect
		.element(page.getByRole("button", { name: "server-counter: 2" }))
		.toBeVisible();

	await userEvent.click(
		page.getByRole("button", { name: "server-counter-reset" }),
	);
	await expect
		.element(page.getByRole("button", { name: "server-counter: 0" }))
		.toBeVisible();
});
```

### Client component

<details>
<summary><code>client-counter.tsx</code></summary>

```tsx filename="client-counter.tsx"
"use client";

import { useState, type ReactElement } from "react";

export function ClientCounter(): ReactElement {
	const [count, setCount] = useState(0);
	return (
		<button
			onClick={() => {
				setCount((c) => c + 1);
			}}
		>
			client-counter: {count}
		</button>
	);
}
```

</details>

```tsx filename="client-counter.test.tsx"
import { ClientCounter } from "./client-counter.js";
import { expect, test } from "vitest";
import { renderServer } from "vitest-plugin-rsc/testing-library";
import { userEvent, page } from "vitest/browser";

test("ClientCounter", async () => {
	await renderServer(<ClientCounter />);

	await userEvent.click(
		page.getByRole("button", { name: "client-counter: 0" }),
	);
	await userEvent.click(
		page.getByRole("button", { name: "client-counter: 1" }),
	);
	await expect
		.element(page.getByRole("button", { name: "client-counter: 2" }))
		.toBeVisible();
});
```
