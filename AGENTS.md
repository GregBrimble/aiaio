# Template

Read [`./docs/AIAIO.md`](./docs/AIAIO.md) for information on provisioning a new application with this template and pulling and applying the latest changes of the template to an existing application.

# Workflow

Before committing work, run `npm run check` to ensure that the codebase is free of errors.

Git commit messages must contain a complete and comprehensive description of the steps required to repeat the undertaken work.

# Grammar & syntax

When referencing a path, always use a leading `./` and, when describing a directory, always suffix the path with a trailing slash. For example, `./worker/index.ts` and `./web/components/`.

# Dependencies

Always use `--save-exact` when installing new dependencies.
