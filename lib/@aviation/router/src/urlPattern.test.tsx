import {
	type URLPatternRoute,
	URLPatternRouter,
	useURLPatternResult,
} from "./urlPattern.js";
import { getContext, runWithContext } from "@aviation/context";
import { renderToString } from "react-dom/server";
import { describe, it } from "vitest";

describe("@aviation/router", () => {
	const contextKey = Symbol("request");

	const BlogPage = () => {
		const urlPatternResult = useURLPatternResult();
		const slug = urlPatternResult.pathname.groups.slug;
		return `Blog page: ${String(slug)}`;
	};

	const marketingRoutes: URLPatternRoute[] = [
		{
			urlPattern: new URLPattern({ pathname: "/" }),
			render: () => "Landing page",
		},
		{
			urlPattern: new URLPattern({ pathname: "/about" }),
			render: () => "About page",
		},
		{
			urlPattern: new URLPattern({ pathname: "/blog" }),
			render: () => "Blog page",
		},
		{
			urlPattern: new URLPattern({ pathname: "/blog/:slug" }),
			render: BlogPage,
		},
	];

	const ProductPage = () => {
		const urlPatternResult = useURLPatternResult();
		const id = urlPatternResult.pathname.groups.id;
		return `Product page: ${String(id)}`;
	};

	const dashboardRoutes: URLPatternRoute[] = [
		{
			urlPattern: new URLPattern({ pathname: "/dashboard/sign-in" }),
			render: () => "Sign-in page",
		},
		{
			urlPattern: new URLPattern({ pathname: "/dashboard/*" }),
			render: () => (
				<>
					Dashboard header
					<URLPatternRouter
						request={getContext(contextKey)}
						routes={[
							{
								urlPattern: new URLPattern({ pathname: "/dashboard/" }),
								render: () => "Dashboard page",
							},
							{
								urlPattern: new URLPattern({ pathname: "/dashboard/products" }),
								render: () => "Products page",
							},
							{
								urlPattern: new URLPattern({
									pathname: "/dashboard/products/:id",
								}),
								render: ProductPage,
							},
							{
								urlPattern: new URLPattern(),
								render: () => "Dashboard 404 page",
							},
						]}
					/>
				</>
			),
		},
	];

	const NotFoundPage = () => {
		const urlPatternResult = useURLPatternResult();
		const pathnameMatch = urlPatternResult.pathname.groups[0];
		return `404 page: ${String(pathnameMatch)} was not found`;
	};

	const BusinessApp = () => (
		<URLPatternRouter
			request={getContext(contextKey)}
			routes={[
				...marketingRoutes,
				...dashboardRoutes,
				{ urlPattern: new URLPattern(), render: NotFoundPage },
			]}
		/>
	);

	const CustomerLandingPage = () => {
		const urlPatternResult = useURLPatternResult();
		const hostname = urlPatternResult.hostname.input;
		return `Customer landing page: ${hostname}`;
	};

	const CustomerProductPage = () => {
		const urlPatternResult = useURLPatternResult();
		const id = urlPatternResult.pathname.groups.id;
		return `Customer products page: ${String(id)}`;
	};

	const customerRoutes: URLPatternRoute[] = [
		{
			urlPattern: new URLPattern({ pathname: "/" }),
			render: CustomerLandingPage,
		},
		{
			urlPattern: new URLPattern({ pathname: "/products" }),
			render: () => "Customer products page",
		},
		{
			urlPattern: new URLPattern({ pathname: "/products/:id" }),
			render: CustomerProductPage,
		},
		{ urlPattern: new URLPattern(), render: () => "Customer 404 page" },
	];

	const allRoutes: URLPatternRoute[] = [
		{
			urlPattern: new URLPattern({ hostname: "example.com" }),
			render: BusinessApp,
		},
		...customerRoutes,
	];

	it("it delegates out to routes correctly", ({ expect }) => {
		expect(
			runWithContext(contextKey, new Request("https://example.com/"), () =>
				renderToString(
					<URLPatternRouter
						request={getContext(contextKey)}
						routes={allRoutes}
					/>,
				),
			),
		).toMatchInlineSnapshot(`"Landing page"`);
		expect(
			runWithContext(contextKey, new Request("https://example.com/about"), () =>
				renderToString(
					<URLPatternRouter
						request={getContext(contextKey)}
						routes={allRoutes}
					/>,
				),
			),
		).toMatchInlineSnapshot(`"About page"`);
		expect(
			runWithContext(contextKey, new Request("https://example.com/blog"), () =>
				renderToString(
					<URLPatternRouter
						request={getContext(contextKey)}
						routes={allRoutes}
					/>,
				),
			),
		).toMatchInlineSnapshot(`"Blog page"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://example.com/blog/hello-world"),
				() =>
					renderToString(
						<URLPatternRouter
							request={getContext(contextKey)}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"Blog page: hello-world"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://example.com/blog/hello-world/non-existent"),
				() =>
					renderToString(
						<URLPatternRouter
							request={getContext(contextKey)}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(
			`"404 page: /blog/hello-world/non-existent was not found"`,
		);
		expect(
			runWithContext(
				contextKey,
				new Request("https://example.com/non-existent"),
				() =>
					renderToString(
						<URLPatternRouter
							request={getContext(contextKey)}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"404 page: /non-existent was not found"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://example.com/dashboard/sign-in"),
				() =>
					renderToString(
						<URLPatternRouter
							request={getContext(contextKey)}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"Sign-in page"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://example.com/dashboard/"),
				() =>
					renderToString(
						<URLPatternRouter
							request={getContext(contextKey)}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"Dashboard header<!-- -->Dashboard page"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://example.com/dashboardnon-existent"),
				() =>
					renderToString(
						<URLPatternRouter
							request={getContext(contextKey)}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"404 page: /dashboardnon-existent was not found"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://example.com/dashboard/non-existent"),
				() =>
					renderToString(
						<URLPatternRouter
							request={
								new Request("https://example.com/dashboard/non-existent")
							}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"Dashboard header<!-- -->Dashboard 404 page"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://example.com/dashboard/products"),
				() =>
					renderToString(
						<URLPatternRouter
							request={getContext(contextKey)}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"Dashboard header<!-- -->Products page"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://example.com/dashboard/products/123"),
				() =>
					renderToString(
						<URLPatternRouter
							request={
								new Request("https://example.com/dashboard/products/123")
							}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"Dashboard header<!-- -->Product page: 123"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://customer.example.com/"),
				() =>
					renderToString(
						<URLPatternRouter
							request={getContext(contextKey)}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"Customer landing page: customer.example.com"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://customer.example.com/products"),
				() =>
					renderToString(
						<URLPatternRouter
							request={getContext(contextKey)}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"Customer products page"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://customer.example.com/products/123"),
				() =>
					renderToString(
						<URLPatternRouter
							request={getContext(contextKey)}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"Customer products page: 123"`);
		expect(
			runWithContext(
				contextKey,
				new Request("https://customer.example.com/non-existent"),
				() =>
					renderToString(
						<URLPatternRouter
							request={getContext(contextKey)}
							routes={allRoutes}
						/>,
					),
			),
		).toMatchInlineSnapshot(`"Customer 404 page"`);
	});
});
