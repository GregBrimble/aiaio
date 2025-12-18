import { decodeServerActionBody, executeServerAction } from "./action.js";
import { parseRenderRequest } from "./request.js";
import {
	renderToReadableStream,
	decodeAction,
	decodeFormState,
} from "@vitejs/plugin-rsc/rsc";
import type { JSX } from "react";
import type { ReactFormState } from "react-dom/client";

export type RscPayload = {
	root: React.ReactNode;
	returnValue?: { ok: boolean; data: unknown };
	formState?: ReactFormState;
};

export default function generateRSC({
	request,
	ssr,
	generateServerActionErrorResponse,
	Root,
}: {
	request: Request;
	ssr: (
		rscStream: ReadableStream<Uint8Array>,
		options: {
			request: Request;
			formState?: ReactFormState;
			nonce?: string;
		},
	) => Promise<Response>;
	generateServerActionErrorResponse: (thrown: unknown) => Response;
	Root: () => JSX.Element;
}) {
	const renderRequest = parseRenderRequest(request);
	request = renderRequest.request;

	const rsc = async () => {
		let returnValue: RscPayload["returnValue"] | undefined;
		let formState: ReactFormState | undefined;
		let temporaryReferences: unknown;
		let actionStatus: number | undefined;
		if (renderRequest.isAction) {
			if (renderRequest.actionId) {
				const body = await decodeServerActionBody(request);
				const result = await executeServerAction(renderRequest.actionId, body);
				returnValue = result.returnValue;
				temporaryReferences = result.temporaryReferences;
				if (!returnValue.ok) {
					actionStatus = 500;
				}
			} else {
				const formData = await request.formData();
				const decodedAction = (await decodeAction(
					formData,
				)) as () => Promise<unknown>;
				try {
					const result = await decodedAction();
					formState = await decodeFormState(result, formData);
				} catch (thrown) {
					return generateServerActionErrorResponse(thrown);
				}
			}
		}

		const rscPayload: RscPayload = {
			root: <Root />,
			...(formState ? { formState } : {}),
			...(returnValue ? { returnValue } : {}),
		};
		const rscOptions = { temporaryReferences };
		const rscStream = renderToReadableStream<RscPayload>(
			rscPayload,
			rscOptions,
		);

		if (renderRequest.isRsc) {
			return new Response(rscStream, {
				...(actionStatus ? { status: actionStatus } : {}),
				headers: {
					"content-type": "text/x-component;charset=utf-8",
				},
			});
		}

		return ssr(rscStream, { request, ...(formState ? { formState } : {}) });
	};

	return { rsc, request };
}
