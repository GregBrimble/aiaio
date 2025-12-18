import generateRSC from "../../lib/@aviation/destinations/src/international/rsc.js";
import { ctxContext, envContext, requestContext } from "../context.js";
import { Root } from "../root.js";
import { runWithContext } from "@aviation/context";

export async function handler(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	const { renderHTML } = await import.meta.viteRsc.loadModule<
		typeof import("./entry.ssr.tsx")
	>("ssr", "index");

	const rsc = generateRSC({
		request,
		ssr: renderHTML,
		generateServerActionErrorResponse: () =>
			new Response("Internal Server Error: server action failed", {
				status: 500,
			}),
		Root,
	});

	return runWithContext(requestContext, rsc.request, () =>
		runWithContext(envContext, env, () =>
			runWithContext(ctxContext, ctx, rsc.rsc),
		),
	);
}
