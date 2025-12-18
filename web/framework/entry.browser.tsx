import { GlobalErrorBoundary } from "../error-boundary.js";
import browser from "@aviation/destinations/international/browser";

browser({ ErrorBoundary: GlobalErrorBoundary }).catch((e: unknown) => {
	console.error(e);
});
