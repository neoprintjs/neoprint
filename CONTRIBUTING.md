# Contributing to neoprint

Thanks for your interest in contributing! Here's how to get started.

## Setup

```bash
git clone https://github.com/neoprintjs/neoprint.git
cd neoprint
npm install
```

## Development

```bash
npm run dev          # watch mode (rebuild on changes)
npm run docs:dev     # docs dev server
npm test             # run tests
npm run test:watch   # tests in watch mode
npm run lint         # type check
npm run build        # production build
```

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/). This drives automatic changelog generation and versioning.

```
feat: add WebTransport collector        # minor version bump
fix: handle Safari audio context        # patch version bump
feat!: redesign plugin API              # major version bump
docs: update cross-browser guide        # no version bump
test: add entropy calculation tests     # no version bump
perf: reduce audio buffer size          # patch version bump
```

## Pull requests

1. Fork the repo and create a branch from `main`
2. Write tests for new functionality
3. Make sure `npm test` and `npm run lint` pass
4. Use conventional commit messages
5. Open a PR against `main`

## Adding a collector

1. Create `src/collectors/my-collector.ts` implementing the `Collector` interface
2. Register it in `src/collectors/index.ts`
3. Add tests in `tests/`
4. Add documentation in `docs/guide/collectors/`
5. Update the collector count in README and docs

## Reporting bugs

Open an issue at https://github.com/neoprintjs/neoprint/issues with:
- Browser and OS version
- What you expected vs what happened
- A JSON export from the demo (Live Demo > Raw > Download JSON)
