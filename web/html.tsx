import packageJson from "../lib/@aiaio/internal/packageJson.js";
import { getMeta, getRequest } from "./context.js";
import "./index.css";
import type { ReactElement, ReactNode } from "react";

export function Html({ render }: { render: () => ReactNode }): ReactElement {
	const children = render();
	const meta = getMeta();
	const request = getRequest();
	const url = new URL(request.url);

	const openGraphImageUrl = `${url.origin}${url.pathname.replace(/\/?/, "/")}/open-graph.png`;

	return (
		<html lang="en" dir="ltr" className="h-full">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{meta.title}</title>
				{meta.description && (
					<meta name="description" content={meta.description} />
				)}
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="canonical" href={url.href} />
				<meta property="og:title" content={meta.title} />
				<meta property="og:site_name" content={packageJson.title} />
				<meta property="og:type" content="website" />
				<meta property="og:url" content={url.href} />
				<meta property="og:image" content={openGraphImageUrl} />
				<meta property="og:image:type" content="image/png" />
				<meta property="og:image:width" content="1200" />
				<meta property="og:image:height" content="630" />
				{meta.description && (
					<meta property="og:description" content={meta.description} />
				)}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={meta.title} />
				<meta name="twitter:image" content={openGraphImageUrl} />
				{meta.description && (
					<meta name="twitter:description" content={meta.description} />
				)}
				<script type="application/ld+json">
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebSite",
						name: packageJson.title,
						url: url.origin,
					})}
				</script>
			</head>
			<body className="h-full bg-white antialiased dark:bg-gray-900">
				{children}
				<footer>
					<div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
						<p className="mt-10 text-center text-sm/6 text-gray-600 dark:text-gray-400">
							Bootstrapped with{" "}
							<a
								href="https://github.com/GregBrimble/aiaio"
								target="_blank"
								rel="noreferrer"
								className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
							>
								AIAIO, the AI All-In-One application toolkit
							</a>
							.
						</p>
					</div>
				</footer>
			</body>
		</html>
	);
}
