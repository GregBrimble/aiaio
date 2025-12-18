import { promises } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

interface IconConfig {
	outputPath: string;
	size: number;
	colorScheme: "light" | "dark";
}

async function svgToPng(svgContent: string, config: IconConfig): Promise<void> {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.setViewportSize({ width: config.size, height: config.size });
	await page.emulateMedia({ colorScheme: config.colorScheme });

	const size = String(config.size);
	const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px; }
          svg { width: ${size}px; height: ${size}px; }
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
		path: config.outputPath,
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

	const icons: IconConfig[] = [
		{
			outputPath: join(import.meta.dirname, "../assets/favicon.png"),
			size: 512,
			colorScheme: "light",
		},
		{
			outputPath: join(import.meta.dirname, "../assets/icon.png"),
			size: 1024,
			colorScheme: "light",
		},
		{
			outputPath: join(import.meta.dirname, "../assets/icon@dark.png"),
			size: 1024,
			colorScheme: "dark",
		},
		{
			outputPath: join(import.meta.dirname, "../assets/favicon@dark.png"),
			size: 512,
			colorScheme: "dark",
		},
		{
			outputPath: join(import.meta.dirname, "../public/apple-touch-icon.png"),
			size: 180,
			colorScheme: "light",
		},
	];

	for (const icon of icons) {
		await svgToPng(svg, icon);
	}
}

main().catch((e: unknown) => {
	throw e;
});
