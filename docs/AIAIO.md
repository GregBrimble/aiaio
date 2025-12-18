# AIAIO (the AI All-In-One application toolkit)

This is an opinionated and unapologetically modern template for creating new applications in 2026. It can bootstrap any one or combination of:

- **a web application** using Cloudflare Workers, React Server Components (and React Compiler), Tailwind and Vite (Rolldown);
- **a command-line interface (CLI)** using Effect and Node.js with type stripping;
- **a Raycast extension**, and
- **local scripts** using Node.js with type stripping.

For core developer tooling, it uses TypeScript (native), Vitest, Prettier, ESLint, and mise or asdf.

## Usage

### Starting a new application

1. Update `./package.json`:
   - Update the `name` (use the new application's directory name if the user didn't specify a project name directly).

   - Update the `title` to a titlecase, human-friendly version of the same name as was used for `name` (e.g. `"a-new-project"` becomes `"A New Project"`)

   - Set `aiaio.version` to the git commit hash of this template. The git commit hash of this template can be found by running `git rev-parse --short HEAD` in this `aiaio` template directory.

   Example:

   ```jsonc
   {
   	"name": "a-new-project", // <-- update the `name`
   	"title": "A New Project", // <-- update the `title`
   	"...": "...",
   	"aiaio": {
   		"version": "ed3891a11", // <-- update the `aiaio.version`
   	},
   }
   ```

1. Update `./README.md` with a titlecase, human-friendly version (use the same `title` as was used in `./package.json`).

1. Update `./wrangler.toml`:
   - Update the `name` (use the same `name` as was used in `./package.json`).

1. Run `npm install` to install the dependencies.

1. Run `npm run check` to validate the project has been provisioned correctly.

1. Run `git remote add template https://github.com/GregBrimble/aiaio.git` to add an upstream so changes to the template can be pulled independently of the application's upstream.

1. Run `git commit -m "Project initialized with aiaio"`.

### Updating an existing application

If you are updating an application which was originally bootstrapped with the AIAIO template, and has since been modified:

1. Run `git remote -v` to list the configured remote upstreams. Add the template upstream if it does not yet already exist: `git remote add template https://github.com/GregBrimble/aiaio.git`.

1. Look at the `aiaio.version` in the existing application's `./package.json`.

   Example:

   ```jsonc
   {
   	"name": "an-existing-application",
   	"...": "...",
   	"aiaio": {
   		"version": "5089c116f", // <-- read the `aiaio.version`
   	},
   }
   ```

1. Run `git fetch template` to grab the latest `aiaio` changes.

1. Use `git log` to list the changes from `aiaio.version`. For example, run `git log 5089c116f..template/HEAD`.

1. Incrementally apply the changes listed to the existing application. The git commit message will contain a description of the work. It may make sense to cherry-pick the commit directly and resolve merge conflicts, or it may make sense to instead follow the instructions in the git commit message in order to replicate the work. Use your best judgement. Run `npm run check` after each commit to ensure mistakes don't accumulate.

1. Lastly, update `aiaio.version` in `./package.json` to reflect the git commit of the `aiaio` template that we just brought the existing application up to.

### Making a change to the `aiaio` template

1. After making changes, ensure `npm run check` still passes.

1. Git commit messages must contain a complete description of steps required to repeat this work. As stated above, they will be used as instructions for upgrading a previously initialized project, and so must describe reproductible steps to upgrade the project to this new state.
