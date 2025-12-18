"use client";

import * as Headless from "@headlessui/react";
import React, { forwardRef } from "react";

export const Link = forwardRef(function Link(
	{
		prefetch = true,
		...props
	}: { href: string; prefetch?: boolean } & React.ComponentPropsWithoutRef<"a">,
	ref: React.ForwardedRef<HTMLAnchorElement>,
) {
	return (
		<Headless.DataInteractive>
			<a data-prefetch={prefetch ? "" : undefined} {...props} ref={ref}>
				{props.children}
			</a>
		</Headless.DataInteractive>
	);
});
