import { handler } from "../web/framework/entry.rsc.js";
import { WorkerEntrypoint } from "cloudflare:workers";

export default class extends WorkerEntrypoint {
	override async fetch(request: Request) {
		return await handler(request, this.env, this.ctx);
	}
}

if (import.meta.hot) {
	import.meta.hot.accept();
}
