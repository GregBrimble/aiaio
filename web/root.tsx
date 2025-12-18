import { getRequest } from "./context.js";
import { Html } from "./html.js";
import { Home } from "./pages/home.js";
import { NotFound } from "./pages/not-found.js";
import { URLPatternRouter } from "@aviation/router/urlPattern";

export function Root() {
	return (
		<Html>
			<URLPatternRouter
				request={getRequest()}
				routes={[
					{
						urlPattern: new URLPattern({ pathname: "/" }),
						render: Home,
					},
					{
						urlPattern: new URLPattern(),
						render: NotFound,
					},
				]}
			/>
		</Html>
	);
}
