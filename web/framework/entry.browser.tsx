import browser from "../../lib/@aviation/destinations/src/international/browser.js";
import { GlobalErrorBoundary } from "../error-boundary.js";

browser({ ErrorBoundary: GlobalErrorBoundary }).catch((e: unknown) => {
	console.error(e);
});
