import { interceptRequest, interceptWebSocket } from "./utils/playwright";
import { launch } from "@cloudflare/playwright";
import { env, exports } from "cloudflare:workers";
import { describe, it } from "vitest";

describe("Worker", () => {
	it("returns a 200 OK HTML response with the React application", async ({
		expect,
	}) => {
		const response = await exports.default.fetch("http://example.com/");

		expect(response.status).toBe(200);

		const {
			"content-security-policy": contentSecurityPolicyHeader,
			...remainingHeaders
		} = Object.fromEntries(response.headers.entries());
		expect(
			contentSecurityPolicyHeader?.replace(
				/nonce-[0-9a-f]{32}/,
				"nonce-abc-123",
			),
		).toMatchInlineSnapshot(
			`"base-uri 'self'; default-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'nonce-abc-123'"`,
		);
		expect(remainingHeaders).toMatchInlineSnapshot(`
			{
			  "content-type": "text/html; charset=utf-8",
			  "cross-origin-embedder-policy": "require-corp",
			  "cross-origin-opener-policy": "same-origin",
			  "cross-origin-resource-policy": "same-site",
			  "permissions-policy": "accelerometer=(), all-screens-capture=(), ambient-light-sensor=(), attribution-reporting=(), autoplay=(), battery=(), bluetooth=(), browsing-topics=(), camera=(), captured-surface-control=(), ch-ua-arch=(), ch-ua-bitness=(), ch-ua-full-version-list=(), ch-ua-full-version=(), ch-ua-high-entropy-values=(), ch-ua-mobile=(), ch-ua-model=(), ch-ua-platform-version=(), ch-ua-platform=(), ch-ua-wow64=(), ch-ua=(), compute-pressure=(), cross-origin-isolated=(), deferred-fetch-minimal=(), deferred-fetch=(), digital-credentials-create=(), digital-credentials-get=(), direct-sockets=(), display-capture=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), focus-without-user-activation=(), gamepad=(), geolocation=(), gyroscope=(), hid=(), identity-credentials-get=(), idle-detection=(), join-ad-interest-group=(), keyboard-map=(), language-detector=(), language-model=(), local-fonts=(), magnetometer=(), manual-text=(), mediasession=(), microphone=(), midi=(), monetization=(), navigation-override=(), on-device-speech-recognition=(), otp-credentials=(), payment=(), private-state-token-issuance=(), private-state-token-redemption=(), rewriter=(), run-ad-auction=(), screen-wake-lock=(), serial=(), smart-card=(), speaker-selection=(), storage-access=(), summarizer=(), sync-script=(), sync-xhr=(), translator=(), trust-token-redemption=(), unload=(), usb=(), vertical-scroll=(), window-management=(), writer=(), xr-spatial-tracking=()",
			  "referrer-policy": "strict-origin-when-cross-origin",
			  "x-content-type-options": "nosniff",
			  "x-frame-options": "DENY",
			}
		`);

		const text = await response.text();

		expect(text).toContain("<html");
		expect(text).toContain("<title>");
		expect(text).toContain('<meta name="description');
		expect(text).toContain("__FLIGHT_DATA");
		expect(text).toContain("AIAIO");
	});

	it("returns a 404 response for unknown routes", async ({ expect }) => {
		const response = await exports.default.fetch(
			"http://example.com/unknown-route",
		);

		expect(response.status).toBe(404);

		const text = await response.text();
		expect(text).toContain("Page not found");
		expect(text).toContain("<title>Not Found");
		expect(text).not.toContain('<meta name="description');
	});

	it("renders the React application", async ({ expect }) => {
		const browser = await launch(env.BROWSER);
		const page = await browser.newPage();
		await page.route("http://localhost/**", interceptRequest);
		await page.routeWebSocket("ws://localhost/", interceptWebSocket);

		await page.goto("http://localhost/", { waitUntil: "networkidle" });

		expect(await page.innerText("footer")).toMatchInlineSnapshot(
			`"Bootstrapped with AIAIO, the AI All-In-One application toolkit."`,
		);
	});

	it("navigates via Cap'n Web WebSocket transport", async ({ expect }) => {
		const browser = await launch(env.BROWSER);
		const page = await browser.newPage();
		await page.route("http://localhost/**", interceptRequest);
		await page.routeWebSocket("ws://fakehost/", interceptWebSocket);

		await page.goto("http://localhost/unknown-route", {
			waitUntil: "networkidle",
		});

		expect(await page.innerText("h1")).toBe("Page not found");
		await page.locator("text=Go back home").dispatchEvent("click");
		await page.locator("h1", { hasText: "AIAIO" }).waitFor();
	});
});
