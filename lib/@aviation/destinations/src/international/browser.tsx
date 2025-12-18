import { createRscRenderRequest } from "./request.js";
import type { RscPayload } from "./rsc.js";
import {
	createFromReadableStream,
	createFromFetch,
	setServerCallback,
	createTemporaryReferenceSet,
	encodeReply,
} from "@vitejs/plugin-rsc/browser";
import React, { type JSX, type ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";

export default async function browser({
	ErrorBoundary,
}: {
	ErrorBoundary: ({ children }: { children: ReactNode }) => JSX.Element;
}) {
	let setPayload: (v: RscPayload) => void;

	const initialPayload = await createFromReadableStream<RscPayload>(
		rscStream as ReadableStream<Uint8Array>,
	);

	function BrowserRoot() {
		const [payload, setPayload_] = React.useState(initialPayload);

		React.useEffect(() => {
			setPayload = (v) => {
				React.startTransition(() => {
					setPayload_(v);
				});
			};
		}, [setPayload_]);

		React.useEffect(() => {
			return listenNavigation(() => {
				void fetchRscPayload();
			});
		}, []);

		return payload.root;
	}

	async function fetchRscPayload() {
		const renderRequest = createRscRenderRequest(window.location.href);
		const payload = await createFromFetch<RscPayload>(fetch(renderRequest));
		setPayload(payload);
	}

	setServerCallback(async (id, args) => {
		const temporaryReferences = createTemporaryReferenceSet();
		const renderRequest = createRscRenderRequest(window.location.href, {
			id,
			body: await encodeReply(args, { temporaryReferences }),
		});
		const payload = await createFromFetch<RscPayload>(fetch(renderRequest), {
			temporaryReferences,
		});
		setPayload(payload);
		const { ok, data } = payload.returnValue as { ok: boolean; data: unknown };
		if (!ok) throw data;
		return data;
	});

	const browserRoot = (
		<React.StrictMode>
			<ErrorBoundary>
				<BrowserRoot />
			</ErrorBoundary>
		</React.StrictMode>
	);
	if ("__NO_HYDRATE" in globalThis) {
		createRoot(document).render(browserRoot);
	} else {
		hydrateRoot(document, browserRoot, {
			...(initialPayload.formState
				? { formState: initialPayload.formState }
				: {}),
		});
	}

	if (import.meta.hot) {
		import.meta.hot.on("rsc:update", () => {
			void fetchRscPayload();
		});
	}
}

function listenNavigation(onNavigation: () => void) {
	window.addEventListener("popstate", onNavigation);

	const oldPushState = window.history.pushState.bind(window.history);
	window.history.pushState = function (...args) {
		oldPushState.apply(this, args);
		onNavigation();
	};

	const oldReplaceState = window.history.replaceState.bind(window.history);
	window.history.replaceState = function (...args) {
		oldReplaceState.apply(this, args);
		onNavigation();
	};

	function onClick(e: MouseEvent) {
		const link = (e.target as Element).closest("a");
		if (
			link &&
			link instanceof HTMLAnchorElement &&
			link.href &&
			(!link.target || link.target === "_self") &&
			link.origin === location.origin &&
			!link.hasAttribute("download") &&
			e.button === 0 &&
			!e.metaKey &&
			!e.ctrlKey &&
			!e.altKey &&
			!e.shiftKey &&
			!e.defaultPrevented
		) {
			e.preventDefault();
			history.pushState(null, "", link.href);
		}
	}
	document.addEventListener("click", onClick);

	return () => {
		document.removeEventListener("click", onClick);
		window.removeEventListener("popstate", onNavigation);
		window.history.pushState = oldPushState;
		window.history.replaceState = oldReplaceState;
	};
}
