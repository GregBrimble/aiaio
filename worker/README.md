# Cloudflare Worker

This is directory contains a Cloudflare Worker which renders the React web application in `../web/`.

## Tests

When testing a Cloudflare Worker's handler, use the `exports` helper from the `cloudflare:workers` module. For example:

<details>
<summary><code>index.ts</code></summary>

```ts filename="index.ts"
import { WorkerEntrypoint } from "cloudflare:workers";

export default class extends WorkerEntrypoint {
	override async fetch() {
		return new Response("Hello, world!");
	}
}
```

</details>

```ts filename="index.test.ts"
import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

describe("Worker", () => {
	it("returns a valid response", async () => {
		const response = await exports.default.fetch("http://example.com/");
		expect(response.ok).toBeTruthy();
	});
});
```
