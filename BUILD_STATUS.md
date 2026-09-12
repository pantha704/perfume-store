# Build status

Local source/preflight can run in this workspace, but its network cannot resolve `registry.npmjs.org`, so dependency installation and a truthful Next.js production build cannot be performed here.

The repository CI is therefore the build authority: it installs dependencies on GitHub Actions, then runs preflight, ESLint, architecture tests, unit tests, TypeScript and `next build`. Do not call the build production-ready until that workflow passes.
