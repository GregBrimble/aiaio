import { type Route, generateRouter } from "./index.js";

type URLPatternResult = NonNullable<ReturnType<URLPattern["exec"]>>;

interface IntermediateURLPatternRouteContext {
	urlPatternResult: URLPatternResult | null;
}

interface URLPatternRouteContext {
	urlPatternResult: URLPatternResult;
}

export interface URLPatternRoute extends Route {
	urlPattern: URLPattern;
}

const { router: URLPatternRouter, getRouteContext } = generateRouter<
	URLPatternRouteContext,
	URLPatternRoute,
	IntermediateURLPatternRouteContext
>({
	routeContextKey: Symbol("URLPatternRouteContext"),
	generateRouteContext: ({ request, route }) => ({
		urlPatternResult: route.urlPattern.exec(request.url),
	}),
	shouldRenderRoute: (context): context is URLPatternRouteContext =>
		context.urlPatternResult !== null,
});

export { URLPatternRouter };

export const useURLPatternResult = (): URLPatternResult => {
	const routeContext = getRouteContext();
	return routeContext.urlPatternResult;
};
