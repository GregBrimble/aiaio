import { getContext } from "@aviation/context";
import "server-only";

export const requestContext = Symbol("request");
export const envContext = Symbol("env");
export const ctxContext = Symbol("ctx");

export const getRequest = () => getContext<Request>(requestContext);
export const getEnv = () => getContext<Env>(envContext);
export const getCtx = () => getContext<ExecutionContext>(ctxContext);
