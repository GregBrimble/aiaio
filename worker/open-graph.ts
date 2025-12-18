import { interceptRequest } from "./utils/playwright";
import { launch } from "@cloudflare/playwright";

export async function generateOpenGraphImage(
	url: URL,
	env: Env,
): Promise<Response> {
	const pageUrl = new URL(url);
	pageUrl.pathname = pageUrl.pathname.replace(/\/open-graph\.png$/, "") || "/";

	const browser = await launch(env.BROWSER);
	const page = await browser.newPage();

	if (!import.meta.env.DEV) {
		await page.route(`${url.origin}/**`, interceptRequest);
	}

	await page.setViewportSize({ width: 1200, height: 630 });
	await page.goto(pageUrl.href, { waitUntil: "networkidle" });

	const screenshot = await page.screenshot({ type: "png" });

	await browser.close();

	return new Response(screenshot as BodyInit, {
		headers: {
			"Content-Type": "image/png",
		},
	});
}
