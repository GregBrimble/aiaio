import { decodeServerActionBody, executeServerAction } from "./action.js";
import { parseRenderRequest } from "./request.js";
import { RpcTarget } from "capnweb";

type RscRenderFn = (
	request: Request,
	options: {
		returnValue?: { ok: boolean; data: unknown };
		temporaryReferences?: unknown;
	},
) => ReadableStream<Uint8Array>;

export class RscApi extends RpcTarget {
	#render: RscRenderFn;

	constructor(render: RscRenderFn) {
		super();
		this.#render = render;
	}

	async handleRequest(request: Request): Promise<Response> {
		const renderRequest = parseRenderRequest(request);

		let returnValue: { ok: boolean; data: unknown } | undefined;
		let temporaryReferences: unknown;

		if (renderRequest.isAction) {
			if (renderRequest.actionId) {
				const body = await decodeServerActionBody(renderRequest.request);

				const result = await executeServerAction(renderRequest.actionId, body);
				returnValue = result.returnValue;
				temporaryReferences = result.temporaryReferences;
			}
		}

		const rscStream = this.#render(renderRequest.request, {
			...(returnValue ? { returnValue } : {}),
			...(temporaryReferences ? { temporaryReferences } : {}),
		});

		return new Response(rscStream, {
			headers: {
				"content-type": "text/x-component;charset=utf-8",
			},
		});
	}
}
