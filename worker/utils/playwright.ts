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

export const interceptWebSocket: Parameters<Page["routeWebSocket"]>[1] = async (
	webSocketRoute,
) => {
	const request = new Request(webSocketRoute.url(), {
		headers: { Upgrade: "websocket" },
	});

	const { webSocket } = await exports.default.fetch(request);

	if (!webSocket) {
		void webSocketRoute.close({
			code: 1011,
			reason: "Server did not return a WebSocket",
		});
		return;
	}

	webSocket.accept();

	webSocketRoute.onMessage((message) => {
		webSocket.send(message);
	});

	webSocketRoute.onClose((code, reason) => {
		webSocket.close(code, reason);
	});

	webSocket.addEventListener("message", (event) => {
		webSocketRoute.send(event.data as string | Buffer);
	});

	webSocket.addEventListener("close", (event) => {
		void webSocketRoute.close({ code: event.code, reason: event.reason });
	});
};
