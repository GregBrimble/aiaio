import { interceptRequest } from "./utils/playwright";
import { launch } from "@cloudflare/playwright";

export async function generateOpenGraphImage(
	url: URL,
	env: Env,
): Promise<Response> {
	const pageUrl = new URL(url);
	pageUrl.pathname = pageUrl.pathname.replace(/\/open-graph\.png$/, "") || "/";

	const browser = await launch(env.BROWSER);
	try {
		const page = await browser.newPage();

		if (!import.meta.env.DEV) {
			await page.route(`${url.origin}/**`, interceptRequest);
		}

		await page.setViewportSize({ width: 1200, height: 630 });
		const pageResponse = await page.goto(pageUrl.href, {
			waitUntil: "networkidle",
		});

		const screenshot = await page.screenshot({ type: "png" });

		const headers: HeadersInit = { "Content-Type": "image/png" };
		const pageCacheControl = await pageResponse?.headerValue("Cache-Control");
		if (pageCacheControl) {
			headers["Cache-Control"] = pageCacheControl;
		}

		return new Response(screenshot as BodyInit, { headers });
	} finally {
		await browser.close();
	}
}
