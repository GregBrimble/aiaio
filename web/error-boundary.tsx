"use client";

import { Button } from "./components/button.js";
import { Html } from "./html.js";
import React from "react";

export function GlobalErrorBoundary(props: { children: React.ReactNode }) {
	return (
		<ErrorBoundary errorComponent={DefaultGlobalErrorPage}>
			{props.children}
		</ErrorBoundary>
	);
}

class ErrorBoundary extends React.Component<{
	children?: React.ReactNode;
	errorComponent: React.FC<{
		error: Error;
		reset: () => void;
	}>;
}> {
	override state: { error: Error | null } = { error: null };

	static getDerivedStateFromError(error: Error) {
		return { error };
	}

	reset = () => {
		this.setState({ error: null });
	};

	override render() {
		const error = this.state.error;
		if (error) {
			return <this.props.errorComponent error={error} reset={this.reset} />;
		}
		return this.props.children;
	}
}

function DefaultGlobalErrorPage(props: { error: Error; reset: () => void }) {
	return (
		<Html
			render={() => (
				<main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-900">
					<div className="text-center">
						{import.meta.env.DEV && (
							<pre className="font-mono text-base font-semibold text-indigo-600 dark:text-indigo-400">
								{props.error.name}
							</pre>
						)}
						<h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white">
							Caught an unexpected error
						</h1>
						{import.meta.env.DEV && props.error.stack && (
							<pre className="mt-6 text-left font-mono text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
								{props.error.stack}
							</pre>
						)}
						<div className="mt-10 flex items-center justify-center gap-x-6">
							<Button
								onClick={() => {
									React.startTransition(() => {
										props.reset();
									});
								}}
							>
								Reset
							</Button>
						</div>
					</div>
				</main>
			)}
		/>
	);
}
