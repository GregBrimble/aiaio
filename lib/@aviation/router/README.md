# `@aviation/router`

A WinterCG-compatible request router for React

## Installation

```sh
npm install @aviation/router
```

## Usage

`@aviation/router` is a collection of routers that allow you to delegate rendering to specific React components, based off of a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) instance.

`@aviation/router` includes the following routers:

- `@aviation/router/urlPattern`

### `@aviation/router/urlPattern`

`@aviation/router/urlPattern` allows you to define routes with the [`URLPattern` API](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern), and compares the `Request`'s URL against those route `URLPattern`s.

#### `URLPatternRoute`

An `object` you need to create which designates a single route that can be delegated to by the `URLPatternRouter`.

##### Properties

- `urlPattern`: a `URLPattern`
- `render`: a `Function` which accepts no parameters and returns the `ReactNode` to render if the route matches

#### `URLPatternRouter`

This is a React component which, if it is composed of multiple pages, you will likely use as the entrypoint of your application. However, you can also use this as deeply in your application as you need, including nesting this one `URLPatternRouter` within another, if you need to group together your routes in more complex configurations. The `routes` array is evaluated in sequential order, and once a route matches, evaluation stops. In other words, only the first route that matches the request will be rendered. If no route matches the incoming request, nothing is rendered. See the examples below if you want to learn how to construct a 404-handling catch-all page.

##### Properties

- `request`: a `Request`
- `routes`: an array of `URLPatternRoute`s

#### `useURLPatternResult()`

A function you can call from within a React component that has been delegated to. This is useful for getting the URL parameters which matched for that route.

##### Return value

The result of running [`URLPattern.exec(request.url)`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern/exec#return_value) from within the router.

### Examples

#### Route across several pages

```tsx
import { URLPatternRoute, URLPatternRouter } from "@aviation/router/urlPattern";

const request: Request;

const LandingPage = () => {
	return <h1>Hello, world!</h1>;
};

const AboutPage = () => {
	return <h1>About</h1>;
};

const routes: URLPatternRoute[] = [
	{
		urlPattern: new URLPattern({ pathname: "/" }),
		render: LandingPage,
	},
	{
		urlPattern: new URLPattern({ pathname: "/about" }),
		render: AboutPage,
	},
];

const Router = () => {
	return <URLPatternRouter request={request} routes={routes} />;
};

// `Router` will render "<h1>Hello, world!</h1>" for a request to https://example.com/
// `Router` will render "<h1>About</h1>" for a request to https://example.com/about
// `Router` will render nothing for a request to https://example.com/non-existent
```

#### Dynamic route parameter

```tsx
import {
	URLPatternRoute,
	URLPatternRouter,
	useURLPatternResult,
} from "@aviation/router/urlPattern";

const request: Request;

const BlogPage = () => {
	const urlPatternResult = useURLPatternResult();
	const slug = urlPatternResult.pathname.groups.slug;
	return `Blog page: ${slug}`;
};

const routes: URLPatternRoute[] = [
	{
		urlPattern: new URLPattern({ pathname: "/blog/:slug" }),
		render: BlogPage,
	},
];

const Router = () => {
	return <URLPatternRouter request={request} routes={routes} />;
};

// `Router` will render "Blog page: hello-world" for a request to https://example.com/blog/hello-world
// `Router` will render nothing for a request to https://example.com/blog/hello-world/non-existent
```

#### 404 (catch-all) page

```tsx
import {
	URLPatternRoute,
	URLPatternRouter,
	useURLPatternResult,
} from "@aviation/router/urlPattern";

const request: Request;

const LandingPage = () => {
	return <h1>Hello, world!</h1>;
};

const AboutPage = () => {
	return <h1>About</h1>;
};

const NotFoundPage = () => {
	const urlPatternResult = useURLPatternResult();
	const pathnameMatch = urlPatternResult.pathname.groups[0];
	return `404 page: ${pathnameMatch} was not found`;
};

const routes: URLPatternRoute[] = [
	{
		urlPattern: new URLPattern({ pathname: "/" }),
		render: LandingPage,
	},
	{
		urlPattern: new URLPattern({ pathname: "/about" }),
		render: AboutPage,
	},
	{
		urlPattern: new URLPattern(),
		render: NotFoundPage,
	},
];

const Router = () => {
	return <URLPatternRouter request={request} routes={routes} />;
};

// `Router` will render "<h1>Hello, world!</h1>" for a request to https://example.com/
// `Router` will render "<h1>About</h1>" for a request to https://example.com/about
// `Router` will render "404 page: /non-existent was not found" for a request to https://example.com/non-existent
```

#### Nested routing

```tsx
import {
	URLPatternRoute,
	URLPatternRouter,
	useURLPatternResult,
} from "@aviation/router/urlPattern";

const request: Request;

const DashboardNavigation = () => {
	return <nav>Dashboard navigation</nav>;
};

const DashboardPage = () => {
	return <h1>Dashboard page</h1>;
};

const ProductsPage = () => {
	return <h1>Products page</h1>;
};

const ProductPage = () => {
	const urlPatternResult = useURLPatternResult();
	const id = urlPatternResult.pathname.groups.id;
	return `Product page: ${id}`;
};

const routes: URLPatternRoute[] = [
	{
		urlPattern: new URLPattern({ pathname: "/dashboard/*" }),
		render: () => {
			return (
				<>
					<DashboardNavigation />
					<URLPatternRouter
						request={request}
						routes={[
							{
								urlPattern: new URLPattern({ pathname: "/dashboard/" }),
								render: DashboardPage,
							},
							{
								urlPattern: new URLPattern({ pathname: "/dashboard/products" }),
								render: ProductsPage,
							},
							{
								urlPattern: new URLPattern({
									pathname: "/dashboard/products/:id",
								}),
								render: ProductPage,
							},
						]}
					/>
				</>
			);
		},
	},
];

const Router = () => {
	return <URLPatternRouter request={request} routes={routes} />;
};

// `Router` will render "<nav>Dashboard navigation</nav><h1>Dashboard page</h1>" for a request to https://example.com/dashboard/
// `Router` will render "<nav>Dashboard navigation</nav><h1>Products page</h1>" for a request to https://example.com/dashboard/products
// `Router` will render "<nav>Dashboard navigation</nav>Product page: 123" for a request to https://example.com/dashboard/products/123
```
