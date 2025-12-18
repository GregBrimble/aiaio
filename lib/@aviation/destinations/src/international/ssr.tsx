import type { RscPayload } from "./rsc.js";
import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import React, { type ReactNode } from "react";
import type { ReactFormState } from "react-dom/client";
import { renderToReadableStream } from "react-dom/server.edge";
import { injectRSCPayload } from "rsc-html-stream/server";

export default function generateSSR({
	generateErrorPage,
}: {
	generateErrorPage: (thrown: unknown) => ReactNode;
}) {
	return async function renderHTML(
		rscStream: ReadableStream<Uint8Array>,
		options: {
			request: Request;
			formState?: ReactFormState;
			nonce?: string;
		},
	): Promise<Response> {
		const [rscStream1, rscStream2] = rscStream.tee();

		let payload: Promise<RscPayload> | undefined;
		function SsrRoot() {
			payload ??= createFromReadableStream<RscPayload>(rscStream1);
			return React.use(payload).root;
		}

		const bootstrapScriptContent =
			await import.meta.viteRsc.loadBootstrapScriptContent("index");
		let htmlStream: ReadableStream<Uint8Array>;
		let status: number | undefined;
		try {
			htmlStream = await renderToReadableStream(<SsrRoot />, {
				bootstrapScriptContent,
				...(options.nonce ? { nonce: options.nonce } : {}),
				formState: options.formState ?? null,
			});
		} catch (thrown) {
			status = 500;
			htmlStream = await renderToReadableStream(generateErrorPage(thrown), {
				bootstrapScriptContent: `self.__NO_HYDRATE=1;` + bootstrapScriptContent,
				...(options.nonce ? { nonce: options.nonce } : {}),
			});
		}

		const responseStream = htmlStream.pipeThrough(
			injectRSCPayload(rscStream2, {
				...(options.nonce ? { nonce: options.nonce } : {}),
			}),
		);

		return new Response(responseStream, {
			headers: { "Content-Type": "text/html; charset=utf-8" },
			...(status ? { status } : {}),
		});
	};
}
