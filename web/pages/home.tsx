import packageJson from "../../lib/@aiaio/internal/packageJson.js";
import { Meta } from "../components/meta.js";

export function Home() {
	const title = packageJson.title;
	const description = "Build something great.";

	return (
		<>
			<Meta title={title} description={description} />
			<main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-900">
				<div className="text-center">
					<h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white">
						{title}
					</h1>
					<p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
						Build something great.
					</p>
				</div>
			</main>
		</>
	);
}
