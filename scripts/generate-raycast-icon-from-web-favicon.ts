import { promises } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

async function svgToPng(
	svgContent: string,
	outputPath: string,
	colorScheme: "light" | "dark",
): Promise<void> {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.setViewportSize({ width: 512, height: 512 });
	await page.emulateMedia({ colorScheme });

	const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; width: 512px; height: 512px; }
          svg { width: 512px; height: 512px; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `;

	await page.setContent(html);

	const svgElement = await page.waitForSelector("svg");

	await svgElement.screenshot({
		path: outputPath,
		type: "png",
		omitBackground: true,
	});

	await browser.close();
}

async function main() {
	const svg = await promises.readFile(
		join(import.meta.dirname, "../public/favicon.svg"),
		"utf-8",
	);

	await svgToPng(
		svg,
		join(import.meta.dirname, "../assets/favicon@dark.png"),
		"dark",
	);

	await svgToPng(
		svg,
		join(import.meta.dirname, "../assets/favicon.png"),
		"light",
	);
}

main().catch((e: unknown) => {
	throw e;
});
