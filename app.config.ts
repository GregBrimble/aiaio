import packageJson from "./lib/@aiaio/internal/packageJson.ts";
import type { ExpoConfig } from "expo/config";

const bundleIdentifier = packageJson.homepage.host
	.split(".")
	.reverse()
	.join(".");

export default {
	android: {
		edgeToEdgeEnabled: true,
		package: bundleIdentifier,
		splash: {
			backgroundColor: "#FFFFFF",
			image: "./assets/icon.png",
			dark: {
				backgroundColor: "#000000",
				image: "./assets/icon@dark.png",
			},
		},
	},
	experiments: {
		reactCompiler: true,
	},
	extra: {
		eas: {
			projectId: "",
		},
	},
	icon: "./assets/icon.png",
	ios: {
		bundleIdentifier,
		icon: {
			dark: "./assets/icon@dark.png",
			light: "./assets/icon.png",
		},
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false,
		},
		splash: {
			backgroundColor: "#FFFFFF",
			image: "./assets/icon.png",
			dark: {
				backgroundColor: "#000000",
				image: "./assets/icon@dark.png",
			},
		},
		supportsTablet: true,
	},
	name: packageJson.title,
	slug: packageJson.name,
	userInterfaceStyle: "automatic",
	version: packageJson.version,
} satisfies ExpoConfig;
