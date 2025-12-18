import {
	type HttpMeta,
	runWithContexts,
	requestContext,
	envContext,
	ctxContext,
	httpMetaContext,
	generateDefaultHttpMeta,
} from "../context.js";
import { Root } from "../root.js";
import { generateNonce, getSecurityHeaders } from "./security.js";
import generateRSC from "@aviation/destinations/international/rsc";

export async function handler(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	const nonce = generateNonce();

	const { renderHTML } = await import.meta.viteRsc.loadModule<
		typeof import("./entry.ssr.tsx")
	>("ssr", "index");

	let response: Response;
	const httpMeta: HttpMeta = generateDefaultHttpMeta();
	try {
		const rsc = generateRSC({
			request,
			ssr: (rscStream, options) =>
				renderHTML(rscStream, {
					...options,
					nonce,
					getStatus: () => httpMeta.status,
					getHeaders: () => httpMeta.headers,
				}),
			generateServerActionErrorResponse: (thrown) => {
				console.error(thrown);
				return new Response("Internal Server Error: server action failed", {
					status: 500,
				});
			},
			Root,
		});

		response = await runWithContexts(
			{
				[requestContext]: rsc.request,
				[envContext]: env,
				[ctxContext]: ctx,
				[httpMetaContext]: httpMeta,
			},
			rsc.rsc,
		);
	} catch (thrown) {
		console.error(thrown);
		response = new Response(
			"Internal Server Error: could not evaluate request",
			{ status: 500 },
		);
	}

	const securityHeaders = getSecurityHeaders(nonce);
	for (const [key, value] of Object.entries(securityHeaders)) {
		response.headers.set(key, value);
	}

	return response;
}
