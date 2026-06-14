# DevFocus Codex Guide

## Project

DevFocus is a developer learning platform. This repository contains project
documentation and two separate npm applications rather than a root workspace.

- Product documentation: `P2_문서/`
- Frontend: `P2_코드/frontend/` (Next.js 16, React 19, TypeScript)
- Backend: `P2_코드/backend/` (Express 5, JavaScript ESM, MySQL 8)
- Package manager: npm, independently in each application
- Runtime: Node.js 20 or newer

The checked-in backend is a partial snapshot. Inspect actual files before
assuming every route, service, script, or `src/` path mentioned by documentation
or package scripts exists.

## Source Of Truth

1. Use `P2_문서/` for product, API, authorization, and database requirements.
2. Use nearby implementation for existing code conventions.
3. When documentation and implementation disagree, identify the mismatch before
   changing public behavior or database contracts.
4. Keep the Korean directory names unchanged unless a repository-wide migration
   is explicitly requested.

## Commands

Install and verify each application from its own directory.

```bash
cd P2_코드/frontend
npm ci
npm run lint
npm run build

cd ../backend
npm install
npm test
```

Run all currently available checks from the repository root with:

```bash
.codex/hooks/verify.sh
```

Development servers:

```bash
cd P2_코드/frontend && npm run dev
cd P2_코드/backend && npm run dev
```

## Working Rules

1. Read `AGENTS.md` and the relevant `.codex/rules/*.md` before editing.
2. Read relevant files under `P2_문서/` for feature and API work.
3. Keep frontend API usage aligned with `P2_코드/frontend/lib/api.ts` and the
   documented `/api` contracts.
4. Keep authentication, authorization, validation, and ownership checks on the
   backend even when the frontend also checks them.
5. Use parameterized MySQL queries and update schema documentation with schema
   changes.
6. Do not add dependencies or rename Korean project directories without
   explaining the repository-wide impact.
7. Add focused tests when a test structure exists; do not invent passing results
   when the snapshot lacks files needed to run a command.
8. Report commands run, failures, assumptions, and remaining risks.

## Definition Of Done

- Requested behavior and documented role rules are implemented.
- Loading, empty, error, and success states are handled in frontend work.
- Server inputs and resource permissions are validated.
- Frontend lint and build pass when dependencies and configuration are available.
- Backend tests pass when referenced source and test files are present.
- No credentials, populated `.env` files, build output, or dependency directories
  are committed.
