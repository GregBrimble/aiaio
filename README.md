# AIAIO

Bootstrapped with [AIAIO, the AI All-In-One application toolkit](https://github.com/GregBrimble/aiaio).

## Prerequisites

- [mise](https://mise.jdx.dev/) or [asdf](https://asdf-vm.com/)

## Core commands

- `npm run check`

  Validate the project's types, linting, formatting, build process, tests, etc.

- `npm run fix`

  Attempt to automatically fix issues flagged by `npm run check`.

## Web application

### Structure

- `./web/`

  A React web application.

- `./public/`

  Static assets for the web application.

- `./worker/`

  A Cloudflare Worker which serves the React web application.

### Commands

- `npm run dev:web`

  Start a Vite development server for the web application. This is a close approximation of production, but is not guaranteed to be exact. For a more accurate simulator, run `npm run preview` (though this does not have DX features such as HMR).

- `npm run preview`

  Start a realistic development server for the web application, powered by Wrangler. This is as representative of production as you can get without deploying.

- `npm run deploy`

  Build and deploy the web application to production.

## Command-line interface (CLI)

### Structure

- `./cli/`

  A command-line interface (CLI).

### Commands

- `npx .`

  Execute the CLI. Arguments and flags can be passed directly (e.g. `npx . --help`).

## Raycast extension

### Structure

- `./src/`

  A Raycast extension.

### Commands

- `npm run dev:raycast`

  Start the Raycast extension in development mode.

## Library

### Structure

- `./lib/`

  Code which is shared either privately within this project (e.g. between the web application, CLI and Raycast extension) or publicly on npm.

## Documentation

Additional documentation for this project can be found in `./docs/`. These markdown files contain helpful information and best practices for working in this project.
