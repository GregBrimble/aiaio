import generateRSC from "../../lib/@aviation/destinations/src/international/rsc.js";
import { ctxContext, envContext, requestContext } from "../context.js";
import { Root } from "../root.js";
import { generateNonce, getSecurityHeaders } from "./security.js";
import { runWithContext } from "@aviation/context";

export async function handler(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	const nonce = generateNonce();

	const { renderHTML } = await import.meta.viteRsc.loadModule<
		typeof import("./entry.ssr.tsx")
	>("ssr", "index");

	const rsc = generateRSC({
		request,
		ssr: (rscStream, options) => renderHTML(rscStream, { ...options, nonce }),
		generateServerActionErrorResponse: () =>
			new Response("Internal Server Error: server action failed", {
				status: 500,
			}),
		Root,
	});

	const response = await runWithContext(requestContext, rsc.request, () =>
		runWithContext(envContext, env, () =>
			runWithContext(ctxContext, ctx, rsc.rsc),
		),
	);

	const securityHeaders = getSecurityHeaders(nonce);
	for (const [key, value] of Object.entries(securityHeaders)) {
		response.headers.set(key, value);
	}

	return response;
}
