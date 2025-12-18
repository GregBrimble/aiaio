import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

describe("Worker", () => {
	it("returns a 200 OK HTML response with the React application", async () => {
		const response = await exports.default.fetch("http://example.com/");

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toEqual("text/html");

		const text = await response.text();

		expect(text).toContain("<html");
		expect(text).toContain("AIAIO");
	});
});
