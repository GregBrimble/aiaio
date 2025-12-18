import { getHttpMeta, getRequest } from "./context.js";
import { Html } from "./html.js";
import { Home } from "./pages/home.js";
import { NotFound } from "./pages/not-found.js";
import type { URLPatternRoute } from "@aviation/router/urlPattern";
import { URLPatternRouter } from "@aviation/router/urlPattern";
import type { ReactNode } from "react";

type AppRoute = URLPatternRoute & {
	status?: number;
	headers?: HeadersInit;
};

function applyRouteMeta(route: AppRoute): () => ReactNode {
	return () => {
		const httpMeta = getHttpMeta();
		if (route.status !== undefined) {
			httpMeta.status = route.status;
		}
		if (route.headers !== undefined) {
			const headers = new Headers(httpMeta.headers);
			new Headers(route.headers).forEach((value, key) => {
				headers.set(key, value);
			});
			httpMeta.headers = headers;
		}

		return route.render();
	};
}

const routes: AppRoute[] = [
	{
		urlPattern: new URLPattern({ pathname: "/" }),
		render: Home,
	},
	{
		urlPattern: new URLPattern(),
		render: NotFound,
		status: 404,
	},
];

export function Root() {
	return (
		<Html
			render={() =>
				URLPatternRouter({
					request: getRequest(),
					routes: routes.map((route) => ({
						...route,
						render: applyRouteMeta(route),
					})),
				})
			}
		/>
	);
}
