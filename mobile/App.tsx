import packageJson from "../lib/@aiaio/internal/packageJson";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

export default function App() {
	const title = packageJson.title;
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<View style={[styles.container, isDark ? styles.containerDark : undefined]}>
			<Text style={[styles.title, isDark ? styles.titleDark : undefined]}>
				{title}
			</Text>
			<Text
				style={[
					styles.description,
					isDark ? styles.descriptionDark : undefined,
				]}
			>
				Build something great.
			</Text>
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	containerDark: {
		backgroundColor: "#111827",
	},
	title: {
		fontSize: 48,
		fontWeight: "600",
		letterSpacing: -0.5,
		color: "#111827",
		textAlign: "center",
	},
	titleDark: {
		color: "#fff",
	},
	description: {
		marginTop: 24,
		fontSize: 18,
		fontWeight: "500",
		color: "#6b7280",
		textAlign: "center",
	},
	descriptionDark: {
		color: "#9ca3af",
	},
});
