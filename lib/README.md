# Library

This directory contains modules which are shared either privately within this project (e.g. between the web application, mobile application, CLI and Raycast extension) or publicly on npm.

## Creating a new module

To create a new module in this library:

1. Create a new directory, nested as it will appear on npm if it is published. For example, for a `package.json` of `{ "name": "testing-utils", "...": "..." }`, that module should be created in `./testing-utils/`; but, for a `package.json` of `{ "name": "@my-org/colors", "...": "..." }`, that module should be placed in `./@my-org/colors/`.

1. Link to any `tsconfig.json` files from `../tsconfig.json`. For example, add `{ "path": "./lib/testing-utils/tsconfig.json" }` to the `references` array.

1. Link to the new directory from root `../package.json`. For example, add `"./lib/testing-utils/"` to the `workspaces` array.

## Testing, formatting, and linting

To enforce standards over the relatively trivial, all modules simply inherit root-level configuration for testing, formatting, and linting.
