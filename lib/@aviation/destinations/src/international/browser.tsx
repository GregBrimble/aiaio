import { createRscRenderRequest } from "./request.js";
import type { RscApi } from "./rsc-api.tsx";
import type { RscPayload } from "./rsc.js";
import {
	createFromFetch,
	createFromReadableStream,
	setServerCallback,
	createTemporaryReferenceSet,
	encodeReply,
} from "@vitejs/plugin-rsc/browser";
import type { RpcStub } from "capnweb";
import React, { type JSX, type ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";

const PREFETCH_CACHE_TTL = 30_000; // 30 seconds

interface PrefetchCacheEntry {
	promise: Promise<RscPayload>;
	timestamp: number;
}

const prefetchCache = new Map<string, PrefetchCacheEntry>();

function getCachedPayload(url: string): Promise<RscPayload> | null {
	const entry = prefetchCache.get(url);
	if (!entry) return null;
	if (Date.now() - entry.timestamp > PREFETCH_CACHE_TTL) {
		prefetchCache.delete(url);
		return null;
	}
	return entry.promise;
}

function clearPrefetchCache(): void {
	prefetchCache.clear();
}

export default async function browser({
	ErrorBoundary,
	getRscApi,
}: {
	ErrorBoundary: ({ children }: { children: ReactNode }) => JSX.Element;
	getRscApi: () => RpcStub<RscApi>;
}) {
	let setPayload: (v: RscPayload) => void;

	const initialPayload = await createFromReadableStream<RscPayload>(
		rscStream as ReadableStream<Uint8Array>,
	);

	function prefetchRscPayload(url: string): void {
		if (getCachedPayload(url)) return;

		const promise = createFromFetch<RscPayload>(
			getRscApi().handleRequest(createRscRenderRequest(url)),
		);

		promise.catch(() => {});

		prefetchCache.set(url, {
			promise,
			timestamp: Date.now(),
		});
	}

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
			return listenNavigation({
				onNavigation: () => {
					void fetchRscPayload();
				},
				onPrefetch: (url) => {
					prefetchRscPayload(url);
				},
			});
		}, []);

		return payload.root;
	}

	async function fetchRscPayload() {
		const url = window.location.href;
		const cached = getCachedPayload(url);
		let payload: RscPayload;
		if (cached) {
			payload = await cached;
		} else {
			payload = await createFromFetch<RscPayload>(
				getRscApi().handleRequest(createRscRenderRequest(url)),
			);
		}
		setPayload(payload);
	}

	setServerCallback(async (id, args) => {
		const temporaryReferences = createTemporaryReferenceSet();
		const renderRequest = createRscRenderRequest(window.location.href, {
			id,
			body: await encodeReply(args, { temporaryReferences }),
		});
		clearPrefetchCache();
		const payload = await createFromFetch<RscPayload>(
			getRscApi().handleRequest(renderRequest),
			{
				temporaryReferences,
			},
		);
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

	document.addEventListener("rsc:cache-clear", () => {
		clearPrefetchCache();
	});

	if (import.meta.hot) {
		import.meta.hot.on("rsc:update", () => {
			clearPrefetchCache();
			void fetchRscPayload();
		});
	}
}

function isPrefetchableLink(
	link: HTMLAnchorElement,
): link is HTMLAnchorElement & { href: string } {
	return (
		link.href !== "" &&
		(!link.target || link.target === "_self") &&
		link.origin === location.origin &&
		!link.hasAttribute("download") &&
		link.hasAttribute("data-prefetch")
	);
}

function isNavigableLink(link: HTMLAnchorElement, e: MouseEvent): boolean {
	return (
		link.href !== "" &&
		(!link.target || link.target === "_self") &&
		link.origin === location.origin &&
		!link.hasAttribute("download") &&
		e.button === 0 &&
		!e.metaKey &&
		!e.ctrlKey &&
		!e.altKey &&
		!e.shiftKey &&
		!e.defaultPrevented
	);
}

function listenNavigation({
	onNavigation,
	onPrefetch,
}: {
	onNavigation: () => void;
	onPrefetch: (url: string) => void;
}) {
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
		if (link && link instanceof HTMLAnchorElement && isNavigableLink(link, e)) {
			e.preventDefault();
			history.pushState(null, "", link.href);
		}
	}
	document.addEventListener("click", onClick);

	function onMouseOver(e: MouseEvent) {
		const link = (e.target as Element).closest("a");
		if (link && link instanceof HTMLAnchorElement && isPrefetchableLink(link)) {
			onPrefetch(link.href);
		}
	}
	document.addEventListener("mouseover", onMouseOver);

	function onFocusIn(e: FocusEvent) {
		const link = (e.target as Element).closest("a");
		if (link && link instanceof HTMLAnchorElement && isPrefetchableLink(link)) {
			onPrefetch(link.href);
		}
	}
	document.addEventListener("focusin", onFocusIn);

	return () => {
		document.removeEventListener("click", onClick);
		document.removeEventListener("mouseover", onMouseOver);
		document.removeEventListener("focusin", onFocusIn);
		window.removeEventListener("popstate", onNavigation);
		window.history.pushState = oldPushState;
		window.history.replaceState = oldReplaceState;
	};
}
