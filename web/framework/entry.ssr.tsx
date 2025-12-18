import generateSSR from "../../lib/@aviation/destinations/src/international/ssr.js";
import { Html } from "../html.js";
import type { ReactFormState } from "react-dom/client";

const ssr = generateSSR({
	generateErrorPage: () => (
		<Html>
			<noscript>Internal Server Error: SSR failed</noscript>
		</Html>
	),
});

export function renderHTML(
	rscStream: ReadableStream<Uint8Array>,
	options?: {
		request: Request;
		formState?: ReactFormState;
		nonce?: string;
	},
): Promise<Response> {
	return ssr(rscStream, options);
}
