# `@cloudflare/playwright-in-vitest`

`@cloudflare/playwright` doesn't work in Vitest because of its dependency on `nodejs_compat` and [a bundling issue](https://github.com/cloudflare/workers-sdk/issues/7324).

## Installation

```sh
npm install @cloudflare/playwright-in-vitest
```

## Usage

<details>
<summary><code>wrangler.toml</code></summary>

```toml filename="wrangler.toml"
name = "my-worker"
main = "./index.ts"
compatibility_date = "2026-01-19"

[browser]
binding = "BROWSER"
```

</details>

```ts filename="index.test.ts"
import { launch, type Page } from "@cloudflare/playwright-in-vitest";
import { env, exports } from "cloudflare:workers";
import { describe, it } from "vitest";

const interceptRequest: Parameters<Page["route"]>[1] = async (route) => {
	const playwrightRequest = route.request();
	const request = new Request(playwrightRequest.url(), {
		method: playwrightRequest.method(),
		headers: await playwrightRequest.allHeaders(),
		body: playwrightRequest.postDataBuffer(),
	});
	const response = await exports.default.fetch(request);
	await route.fulfill({
		body: Buffer.from(await response.arrayBuffer()),
		status: response.status,
		headers: Object.fromEntries(response.headers.entries()),
	});
};

describe("Worker", () => {
	it("renders the React application", async ({ expect }) => {
		const browser = await launch(env.BROWSER);
		const page = await browser.newPage();
		await page.route("http://fakehost/**", interceptRequest);

		await page.goto("http://fakehost/");

		expect(await page.innerText("footer")).toMatchInlineSnapshot(
			`"Bootstrapped with AIAIO, the AI All-In-One application toolkit."`,
		);
	});
});
```
