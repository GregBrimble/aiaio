import { Html } from "../html.js";
import generateSSR from "@aviation/destinations/international/ssr";
import type { ReactFormState } from "react-dom/client";

const ssr = generateSSR({
	generateErrorPage: (thrown) => {
		console.error(thrown);
		return (
			<Html
				render={() => <noscript>Internal Server Error: SSR failed</noscript>}
			/>
		);
	},
});

export function renderHTML(
	rscStream: ReadableStream<Uint8Array>,
	options: {
		request: Request;
		formState?: ReactFormState;
		nonce?: string;
		getStatus: () => number;
		getHeaders: () => HeadersInit;
	},
): Promise<Response> {
	return ssr(rscStream, options);
}
