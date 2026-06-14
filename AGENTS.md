# DevFocus Agent Guide

## Shared Contract

- Start with `CODEX.md`, relevant files under `P2_문서/`, package scripts, and
  nearby implementation.
- Treat this repository as two independent npm applications; there is no root
  package workspace.
- Preserve the existing Next.js App Router frontend and Express ESM backend
  patterns.
- Keep changes scoped and do not overwrite unrelated user work.
- Never expose secrets, weaken authorization, or claim an unavailable check
  passed.
- Finish with changed files, verification commands, failures, and residual risks.

## Developer Agent

- Translate documented requirements into frontend, API, and database changes.
- Build accessible, typed React UI under `P2_코드/frontend/`.
- Keep backend modules under `P2_코드/backend/` consistent with the current
  routes/controllers/config layout.
- Add focused tests where the repository has a usable test structure.
- Run `.codex/hooks/verify.sh` before completion.

## Debugger Agent

- Reproduce failures from the affected application directory when practical.
- Compare runtime behavior with the matching API or requirements document.
- Separate missing-snapshot files and environment failures from code defects.
- Add a regression test when practical, apply the smallest root-cause fix, and
  verify adjacent behavior.

## Reviewer Agent

- Lead with correctness, regressions, authorization, input validation,
  accessibility, schema compatibility, and missing tests.
- Cite file and line references and describe concrete failure scenarios.
- Compare implementation changes with `P2_문서/`, not only nearby code.
- Do not edit files unless explicitly asked to fix findings.

## Rule Selection

- Next.js, React, browser, or styling work: `.codex/rules/frontend.md`
- Express, MySQL, API, or cross-layer work: `.codex/rules/fullstack.md`
- Authentication, roles, payments, secrets, user data, or admin/instructor work:
  `.codex/rules/security.md`
