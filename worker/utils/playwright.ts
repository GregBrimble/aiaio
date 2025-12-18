import type { Page } from "@cloudflare/playwright";
import { exports, env } from "cloudflare:workers";

export const interceptRequest: Parameters<Page["route"]>[1] = async (route) => {
	const playwrightRequest = route.request();
	const request = new Request(playwrightRequest.url(), {
		method: playwrightRequest.method(),
		headers: await playwrightRequest.allHeaders(),
		body: playwrightRequest.postDataBuffer() as BodyInit,
	});
	const assetResponse = await env.ASSETS.fetch(request);
	if (assetResponse.ok) {
		await route.fulfill({
			body: Buffer.from(await assetResponse.arrayBuffer()),
			status: assetResponse.status,
			headers: Object.fromEntries(assetResponse.headers.entries()),
		});
	} else {
		const scriptResponse = await exports.default.fetch(request);
		await route.fulfill({
			body: Buffer.from(await scriptResponse.arrayBuffer()),
			status: scriptResponse.status,
			headers: Object.fromEntries(scriptResponse.headers.entries()),
		});
	}
};
