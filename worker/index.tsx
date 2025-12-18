import {
	runWithContexts,
	requestContext,
	envContext,
	ctxContext,
	httpMetaContext,
	generateDefaultHttpMeta,
} from "../web/context.js";
import { handler } from "../web/framework/entry.rsc.js";
import { Root } from "../web/root.js";
import { generateOpenGraphImage } from "./open-graph.js";
import type { RscPayload } from "@aviation/destinations/international/rsc";
import { RscApi } from "@aviation/destinations/international/rsc-api";
import { renderToReadableStream } from "@vitejs/plugin-rsc/rsc";
import { newWorkersRpcResponse, RpcTarget } from "capnweb";
import { WorkerEntrypoint } from "cloudflare:workers";

export class Api extends RpcTarget {
	#rsc: RscApi;

	constructor(env: Env, ctx: ExecutionContext) {
		super();
		this.#rsc = new RscApi((request, options) => {
			try {
				return runWithContexts(
					{
						[requestContext]: request,
						[envContext]: env,
						[ctxContext]: ctx,
						[httpMetaContext]: generateDefaultHttpMeta(),
					},
					() => {
						const rscPayload: RscPayload = {
							root: <Root />,
							...(options.returnValue
								? { returnValue: options.returnValue }
								: {}),
						};
						return renderToReadableStream(rscPayload, {
							temporaryReferences: options.temporaryReferences,
						});
					},
				);
			} catch (thrown) {
				console.error("RSC render failed:", thrown);
				throw thrown;
			}
		});
	}

	get rsc(): RscApi {
		return this.#rsc;
	}
}

export default class extends WorkerEntrypoint<Env> {
	override async fetch(request: Request) {
		if (request.headers.get("Upgrade") === "websocket") {
			return await newWorkersRpcResponse(request, new Api(this.env, this.ctx));
		}

		const url = new URL(request.url);

		if (url.pathname.endsWith("/open-graph.png")) {
			return await generateOpenGraphImage(url, this.env);
		}

		return await handler(request, this.env, this.ctx);
	}
}

if (import.meta.hot) {
	import.meta.hot.accept();
}
