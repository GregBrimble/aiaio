# Command-line interface (CLI)

This directory contains a command-line interface (CLI) powered by [`@effect/cli`](https://effect-ts.github.io/effect/docs/cli).

## Structure

- `./bin/index.ts`

  The entrypoint executed in a terminal.

- `./index.ts`

  The commands and handlers are defined here.

- `./index.test.ts`

  Tests which assert the behavior and functionality of the CLI.

## Commands

To execute the CLI, run `npx .` in the root of this project. If published to npm, the CLI can be invoked by the name of the project in `../package.json`. For example, `npx a-new-project`.

Arguments and flags should immediately follow the invocation (e.g. `npx . --version`).
