import { getContext } from "@aviation/context";

export const requestContext = Symbol("request");
export const envContext = Symbol("env");
export const ctxContext = Symbol("ctx");

export const getRequest = () => getContext<Request>(requestContext);
export const getEnv = () => getContext<Env>(envContext);
export const getCtx = () => getContext<ExecutionContext>(ctxContext);

export interface HttpMeta {
	headers: HeadersInit;
	status: number;
}

export const httpMetaContext = Symbol("httpMeta");
export const getHttpMeta = () => getContext<HttpMeta>(httpMetaContext);
