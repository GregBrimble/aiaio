import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tailwindcss(),
		react({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
		rsc({
			entries: {
				client: "./web/framework/entry.browser.tsx",
				ssr: "./web/framework/entry.ssr.tsx",
			},
			serverHandler: false,
			loadModuleDevProxy: true,
		}),
		cloudflare({
			viteEnvironment: {
				name: "rsc",
			},
		}),
	],
	environments: {
		rsc: {
			build: {
				outDir: "./dist/worker/",
			},
		},
		ssr: {
			keepProcessEnv: false,
			build: {
				outDir: "./dist/worker/ssr/",
			},
			resolve: {
				noExternal: true,
			},
		},
	},
});
