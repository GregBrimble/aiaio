import type { Api } from "../../worker/index.js";
import { GlobalErrorBoundary } from "../error-boundary.js";
import browser from "@aviation/destinations/international/browser";
import type { RpcStub } from "capnweb";
import { newWebSocketRpcSession } from "capnweb";

const rpcUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/`;

let session: RpcStub<Api> | undefined;

function connect(): RpcStub<Api> {
	const stub = newWebSocketRpcSession<Api>(rpcUrl);
	stub.onRpcBroken(() => {
		session = undefined;
		document.dispatchEvent(new CustomEvent("rsc:cache-clear"));
	});
	session = stub;
	return stub;
}

function getSession(): RpcStub<Api> {
	if (!session) {
		return connect();
	}
	return session;
}

function getRscApi() {
	return getSession().rsc;
}

connect();

browser({ ErrorBoundary: GlobalErrorBoundary, getRscApi }).catch(
	(e: unknown) => {
		console.error(e);
	},
);
