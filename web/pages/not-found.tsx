import packageJson from "../../lib/@aiaio/internal/packageJson.js";
import { Button } from "../components/button.js";
import { Meta } from "../components/meta.js";

export function NotFound() {
	return (
		<>
			<Meta title={`Not Found | ${packageJson.title}`} />
			<main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-900">
				<div className="text-center">
					<p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
						404
					</p>
					<h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white">
						Page not found
					</h1>
					<p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
						Sorry, we couldn&apos;t find the page you&apos;re looking for.
					</p>
					<div className="mt-10 flex items-center justify-center gap-x-6">
						<Button href="/">Go back home</Button>
					</div>
				</div>
			</main>
		</>
	);
}
