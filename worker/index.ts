import { handler } from "../web/framework/entry.rsc.js";
import { generateOpenGraphImage } from "./open-graph.js";
import { WorkerEntrypoint } from "cloudflare:workers";

export default class extends WorkerEntrypoint<Env> {
	override async fetch(request: Request) {
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
