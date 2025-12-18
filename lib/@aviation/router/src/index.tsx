import { getContext, runWithContext } from "@aviation/context";
import { type ReactNode } from "react";

export interface Route {
	// TODO: consider allowing setting headers directly from here (would be useful for static pages)
	render: () => ReactNode;
}

type MatchedRoute<T> = Route & {
	context: T;
};

export const generateRouter = <
	RouteContext extends IntermediateRouteContext,
	RouterRoute extends Route,
	IntermediateRouteContext,
>({
	routeContextKey,
	generateRouteContext,
	shouldRenderRoute,
}: {
	routeContextKey: symbol;
	generateRouteContext: ({
		request,
		route,
	}: {
		request: Request;
		route: RouterRoute;
	}) => IntermediateRouteContext;
	shouldRenderRoute: (
		context: IntermediateRouteContext,
	) => context is RouteContext;
}) => {
	return {
		router: ({
			request,
			routes,
		}: {
			request: Request;
			routes: RouterRoute[];
		}) => {
			let matchedRoute: MatchedRoute<RouteContext> | null = null;
			for (let i = 0; i < routes.length; i++) {
				const route = routes[i];
				if (route !== undefined) {
					const context = generateRouteContext({ request, route });
					if (shouldRenderRoute(context)) {
						matchedRoute = { ...route, context };
						break;
					}
				}
			}

			if (matchedRoute !== null) {
				return runWithContext(
					routeContextKey,
					matchedRoute.context,
					matchedRoute.render,
				);
			}

			return null;
		},
		getRouteContext: () => getContext<RouteContext>(routeContextKey),
	};
};
