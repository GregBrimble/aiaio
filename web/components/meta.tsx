import packageJson from "../../lib/@aiaio/internal/packageJson.js";
import { getRequest } from "../context.js";
import type { ReactElement } from "react";

export function Meta({
	title,
	description,
}: {
	title: string;
	description?: string;
}): ReactElement {
	const request = getRequest();
	const url = new URL(request.url);

	const openGraphImageUrl = `${url.origin}${url.pathname.replace(/\/+$/, "")}/open-graph.png`;

	return (
		<>
			<title>{title}</title>
			{description && <meta name="description" content={description} />}
			<meta property="og:title" content={title} />
			<meta property="og:site_name" content={packageJson.title} />
			<meta property="og:type" content="website" />
			<meta property="og:url" content={url.href} />
			<meta property="og:image" content={openGraphImageUrl} />
			<meta property="og:image:type" content="image/png" />
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />
			{description && <meta property="og:description" content={description} />}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={title} />
			<meta name="twitter:image" content={openGraphImageUrl} />
			{description && <meta name="twitter:description" content={description} />}
			<script type="application/ld+json">
				{JSON.stringify({
					"@context": "https://schema.org",
					"@type": "WebPage",
					name: title,
					...(description ? { description } : {}),
					url: url.href,
				})}
			</script>
		</>
	);
}
