import { getContext, runWithContext } from "@aviation/context";

export const requestContext = Symbol("request");
export const envContext = Symbol("env");
export const ctxContext = Symbol("ctx");

export const getRequest = () => getContext<Request>(requestContext);
export const getEnv = () => getContext<Env>(envContext);
export const getCtx = () => getContext<ExecutionContext>(ctxContext);

export const generateDefaultHttpMeta = (): HttpMeta => {
	return {
		status: 200,
		headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
	};
};
export interface HttpMeta {
	headers: HeadersInit;
	status: number;
}

export const httpMetaContext = Symbol("httpMeta");
export const getHttpMeta = () => getContext<HttpMeta>(httpMetaContext);

export function runWithContexts<T>(
	contexts: Record<symbol, unknown>,
	fn: () => T,
): T {
	const keys = Object.getOwnPropertySymbols(contexts);
	return keys.reduceRight<() => T>(
		(next, key) => () => runWithContext(key, contexts[key], next),
		fn,
	)();
}
