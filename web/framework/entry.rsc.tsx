import packageJson from "../../lib/@aiaio/internal/packageJson.ts";
import {
	ctxContext,
	envContext,
	type Meta,
	metaContext,
	requestContext,
} from "../context.js";
import { Root } from "../root.js";
import { generateNonce, getSecurityHeaders } from "./security.js";
import { runWithContext } from "@aviation/context";
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
	const meta: Meta = {
		title: packageJson.title,
		description: null,
		status: 200,
		headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
	};
	try {
		const rsc = generateRSC({
			request,
			ssr: (rscStream, options) =>
				renderHTML(rscStream, {
					...options,
					nonce,
					getStatus: () => meta.status,
					getHeaders: () => meta.headers,
				}),
			generateServerActionErrorResponse: (thrown) => {
				console.error(thrown);
				return new Response("Internal Server Error: server action failed", {
					status: 500,
				});
			},
			Root,
		});

		response = await runWithContext(requestContext, rsc.request, () =>
			runWithContext(envContext, env, () =>
				runWithContext(ctxContext, ctx, () =>
					runWithContext(metaContext, meta, rsc.rsc),
				),
			),
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
