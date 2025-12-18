import { generateNonce, getSecurityHeaders } from "./security.js";
import { describe, it } from "vitest";

describe("generateNonce", () => {
	it("returns a 32-character hex string", ({ expect }) => {
		const nonce = generateNonce();

		expect(nonce).toHaveLength(32);
		expect(nonce).toMatch(/^[0-9a-f]{32}$/);
	});

	it("returns unique values on each call", ({ expect }) => {
		const nonce1 = generateNonce();
		const nonce2 = generateNonce();

		expect(nonce1).not.toBe(nonce2);
	});
});

describe("getSecurityHeaders", () => {
	it("returns security headers with the provided nonce", ({ expect }) => {
		const nonce = "abc123";
		const headers = getSecurityHeaders(nonce);

		expect(headers).toMatchInlineSnapshot(`
			{
			  "Content-Security-Policy": "base-uri 'self'; default-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'nonce-abc123'",
			  "Cross-Origin-Embedder-Policy": "require-corp",
			  "Cross-Origin-Opener-Policy": "same-origin",
			  "Cross-Origin-Resource-Policy": "same-site",
			  "Permissions-Policy": "accelerometer=(), all-screens-capture=(), ambient-light-sensor=(), attribution-reporting=(), autoplay=(), battery=(), bluetooth=(), browsing-topics=(), camera=(), captured-surface-control=(), ch-ua-arch=(), ch-ua-bitness=(), ch-ua-full-version-list=(), ch-ua-full-version=(), ch-ua-high-entropy-values=(), ch-ua-mobile=(), ch-ua-model=(), ch-ua-platform-version=(), ch-ua-platform=(), ch-ua-wow64=(), ch-ua=(), compute-pressure=(), cross-origin-isolated=(), deferred-fetch-minimal=(), deferred-fetch=(), digital-credentials-create=(), digital-credentials-get=(), direct-sockets=(), display-capture=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), focus-without-user-activation=(), gamepad=(), geolocation=(), gyroscope=(), hid=(), identity-credentials-get=(), idle-detection=(), join-ad-interest-group=(), keyboard-map=(), language-detector=(), language-model=(), local-fonts=(), magnetometer=(), manual-text=(), mediasession=(), microphone=(), midi=(), monetization=(), navigation-override=(), on-device-speech-recognition=(), otp-credentials=(), payment=(), private-state-token-issuance=(), private-state-token-redemption=(), rewriter=(), run-ad-auction=(), screen-wake-lock=(), serial=(), smart-card=(), speaker-selection=(), storage-access=(), summarizer=(), sync-script=(), sync-xhr=(), translator=(), trust-token-redemption=(), unload=(), usb=(), vertical-scroll=(), window-management=(), writer=(), xr-spatial-tracking=()",
			  "Referrer-Policy": "strict-origin-when-cross-origin",
			  "X-Content-Type-Options": "nosniff",
			  "X-Frame-Options": "DENY",
			}
		`);
	});
});
