import {
	createTemporaryReferenceSet,
	decodeReply,
	loadServerAction,
} from "@vitejs/plugin-rsc/rsc";

type ServerActionResult = {
	returnValue: { ok: boolean; data: unknown };
	temporaryReferences: unknown;
};

export async function executeServerAction(
	actionId: string,
	body: string | FormData,
): Promise<ServerActionResult> {
	const temporaryReferences = createTemporaryReferenceSet();
	const args = await decodeReply(body, { temporaryReferences });
	const action = await loadServerAction(actionId);

	let returnValue: ServerActionResult["returnValue"];
	try {
		const data = (await Reflect.apply(action, null, args)) as unknown;
		returnValue = { ok: true, data };
	} catch (e) {
		returnValue = { ok: false, data: e };
	}

	return { returnValue, temporaryReferences };
}

export async function decodeServerActionBody(
	request: Request,
): Promise<string | FormData> {
	return request.headers.get("Content-Type")?.startsWith("multipart/form-data")
		? request.formData()
		: request.text();
}
