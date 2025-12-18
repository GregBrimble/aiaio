import packageJson from "../lib/@aiaio/internal/packageJson.js";
import "./index.css";
import type { ReactElement, ReactNode } from "react";

export function Html({ children }: { children: ReactNode }): ReactElement {
	return (
		<html lang="en" dir="ltr" className="h-full">
			<head>
				<meta charSet="UTF-8" />
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{packageJson.title}</title>
			</head>
			<body className="h-full bg-white antialiased dark:bg-gray-900">
				{children}
				<footer>
					<div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
						<p className="mt-10 text-center text-sm/6 text-gray-600 dark:text-gray-400">
							Bootstrapped with{" "}
							<a
								href="https://github.com/GregBrimble/aiaio"
								target="_blank"
								rel="noreferrer"
								className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
							>
								AIAIO, the AI All-In-One application toolkit
							</a>
							.
						</p>
					</div>
				</footer>
			</body>
		</html>
	);
}
