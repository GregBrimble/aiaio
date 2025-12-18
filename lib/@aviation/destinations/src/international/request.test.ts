import { createRscRenderRequest, parseRenderRequest } from "./request.js";
import { describe, it } from "vitest";

describe("@aviation/destinations/international/request", () => {
	describe("createRscRenderRequest", () => {
		it("creates a GET request for RSC without action", ({ expect }) => {
			const request = createRscRenderRequest("https://example.com/page");

			expect(request.method).toBe("GET");
			expect(request.url).toBe("https://example.com/page_.rsc");
			expect(request.headers.get("x-rsc-action")).toBeNull();
		});

		it("creates a POST request for RSC with action", ({ expect }) => {
			const request = createRscRenderRequest("https://example.com/page", {
				id: "action-123",
				body: "test-body",
			});

			expect(request.method).toBe("POST");
			expect(request.url).toBe("https://example.com/page_.rsc");
			expect(request.headers.get("x-rsc-action")).toBe("action-123");
		});

		it("appends RSC postfix to pathname", ({ expect }) => {
			const request = createRscRenderRequest("https://example.com/nested/path");

			expect(new URL(request.url).pathname).toBe("/nested/path_.rsc");
		});

		it("preserves query parameters", ({ expect }) => {
			const request = createRscRenderRequest(
				"https://example.com/page?foo=bar&baz=qux",
			);

			const url = new URL(request.url);
			expect(url.pathname).toBe("/page_.rsc");
			expect(url.searchParams.get("foo")).toBe("bar");
			expect(url.searchParams.get("baz")).toBe("qux");
		});

		it("preserves hash", ({ expect }) => {
			const request = createRscRenderRequest(
				"https://example.com/page#section",
			);

			const url = new URL(request.url);
			expect(url.pathname).toBe("/page_.rsc");
			expect(url.hash).toBe("#section");
		});

		it("handles root path", ({ expect }) => {
			const request = createRscRenderRequest("https://example.com/");

			const url = new URL(request.url);
			expect(url.pathname).toBe("/_.rsc");
		});
	});

	describe("parseRenderRequest", () => {
		it("identifies RSC GET request", ({ expect }) => {
			const request = new Request("https://example.com/page_.rsc");
			const result = parseRenderRequest(request);

			expect(result.isRsc).toBe(true);
			expect(result.isAction).toBe(false);
			expect(result.actionId).toBeUndefined();
			expect(result.url.pathname).toBe("/page");
			expect(result.request.url).toBe("https://example.com/page");
		});

		it("identifies RSC POST request with action", ({ expect }) => {
			const request = new Request("https://example.com/page_.rsc", {
				method: "POST",
				headers: { "x-rsc-action": "action-123" },
			});
			const result = parseRenderRequest(request);

			expect(result.isRsc).toBe(true);
			expect(result.isAction).toBe(true);
			expect(result.actionId).toBe("action-123");
			expect(result.url.pathname).toBe("/page");
		});

		it("throws error for POST RSC request without action id", ({ expect }) => {
			const request = new Request("https://example.com/page_.rsc", {
				method: "POST",
			});

			expect(() => parseRenderRequest(request)).toThrow(
				"Missing action id header for RSC action request",
			);
		});

		it("identifies non-RSC request", ({ expect }) => {
			const request = new Request("https://example.com/page");
			const result = parseRenderRequest(request);

			expect(result.isRsc).toBe(false);
			expect(result.isAction).toBe(false);
			expect(result.actionId).toBeUndefined();
			expect(result.url.pathname).toBe("/page");
			expect(result.request.url).toBe("https://example.com/page");
		});

		it("identifies non-RSC POST request", ({ expect }) => {
			const request = new Request("https://example.com/page", {
				method: "POST",
			});
			const result = parseRenderRequest(request);

			expect(result.isRsc).toBe(false);
			expect(result.isAction).toBe(true);
			expect(result.url.pathname).toBe("/page");
		});

		it("preserves query parameters", ({ expect }) => {
			const request = new Request("https://example.com/page_.rsc?foo=bar");
			const result = parseRenderRequest(request);

			expect(result.url.pathname).toBe("/page");
			expect(result.url.searchParams.get("foo")).toBe("bar");
			expect(result.request.url).toBe("https://example.com/page?foo=bar");
		});

		it("preserves hash", ({ expect }) => {
			const request = new Request("https://example.com/page_.rsc#section");
			const result = parseRenderRequest(request);

			expect(result.url.pathname).toBe("/page");
			expect(result.url.hash).toBe("#section");
		});

		it("preserves headers", ({ expect }) => {
			const request = new Request("https://example.com/page_.rsc", {
				headers: { "x-custom-header": "custom-value" },
			});
			const result = parseRenderRequest(request);

			expect(result.request.headers.get("x-custom-header")).toBe(
				"custom-value",
			);
		});

		it("preserves body for POST requests", async ({ expect }) => {
			const request = new Request("https://example.com/page_.rsc", {
				method: "POST",
				headers: { "x-rsc-action": "action-123" },
				body: "test-body",
			});
			const result = parseRenderRequest(request);

			expect(await result.request.text()).toBe("test-body");
		});

		it("handles root path", ({ expect }) => {
			const request = new Request("https://example.com/_.rsc");
			const result = parseRenderRequest(request);

			expect(result.isRsc).toBe(true);
			expect(result.url.pathname).toBe("/");
			expect(result.request.url).toBe("https://example.com/");
		});

		it("only matches exact RSC postfix", ({ expect }) => {
			const request = new Request("https://example.com/page_.rsc.html");
			const result = parseRenderRequest(request);

			expect(result.isRsc).toBe(false);
			expect(result.url.pathname).toBe("/page_.rsc.html");
		});
	});

	describe("round-trip", () => {
		it("createRscRenderRequest and parseRenderRequest work together", ({
			expect,
		}) => {
			const originalUrl = "https://example.com/page?foo=bar#section";
			const created = createRscRenderRequest(originalUrl);
			const parsed = parseRenderRequest(created);

			expect(parsed.isRsc).toBe(true);
			expect(parsed.isAction).toBe(false);
			expect(parsed.url.pathname).toBe("/page");
			expect(parsed.url.searchParams.get("foo")).toBe("bar");
			expect(parsed.url.hash).toBe("#section");
		});

		it("round-trip with action", async ({ expect }) => {
			const originalUrl = "https://example.com/";
			const created = createRscRenderRequest(originalUrl, {
				id: "action-456",
				body: "action-body",
			});
			const parsed = parseRenderRequest(created);

			expect(parsed.isRsc).toBe(true);
			expect(parsed.isAction).toBe(true);
			expect(parsed.actionId).toBe("action-456");
			expect(await parsed.request.text()).toBe("action-body");
		});
	});
});
