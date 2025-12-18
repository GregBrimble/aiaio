import packageJson from "../lib/@aiaio/internal/packageJson.ts";
import { Schema } from "effect";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OpenCodeProject = Schema.Struct({
	id: Schema.String,
	worktree: Schema.String,
});

export const OpenCodeProjects = Schema.Array(OpenCodeProject);

const waitForPort = async (
	url: string,
	{ timeout = 10_000, interval = 100 } = {},
) => {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		try {
			const response = await fetch(url);
			if (response.ok) {
				return response;
			}
		} catch {
			// Server not ready yet
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
	throw new Error(`Timed out waiting for ${url} after ${String(timeout)}ms`);
};

const projects = Schema.decodeUnknownSync(OpenCodeProjects)(
	await waitForPort("http://localhost:4096/project").then((response) =>
		response.json(),
	),
);

const project = projects.find(
	(project) => project.worktree === join(import.meta.dirname, ".."),
);

if (!project) {
	throw new Error("Project not found");
}

const favicon = await readFile(
	join(import.meta.dirname, "../public/favicon.svg"),
);
const faviconBase64 = `data:image/svg+xml;base64,${favicon.toString("base64")}`;

await fetch(`http://localhost:4096/project/${project.id}`, {
	method: "PATCH",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		name: packageJson.title,
		icon: {
			url: faviconBase64,
		},
	}),
});
