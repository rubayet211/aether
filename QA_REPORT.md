# QA Report - Aether MVP

Date: 2026-06-14

## Automated Checks

| Check | Command | Result |
| --- | --- | --- |
| Unit tests | `pnpm test` | Passed: 4 files, 6 tests |
| TypeScript | `pnpm typecheck` | Passed |
| ESLint | `pnpm lint` | Passed |
| Production build | `pnpm build` | Passed |
| Prisma generate | `pnpm prisma generate` | Passed |
| Turso schema apply | `pnpm turso:schema` | Passed |
| Prisma seed | `pnpm prisma db seed` | Passed |

## Manual QA

| Flow | Result |
| --- | --- |
| Landing page loads with hero and CTAs | Passed |
| Diagnostic assessment completes | Passed |
| Assessment result creates local guest profile | Passed |
| Dashboard shows mastery map and recommendation | Passed |
| Tutor session creation | Passed |
| Tutor chat saves and displays messages | Passed |
| Demo-mode Socratic reply appears | Passed |
| Misconception callout appears for force-keeps-motion phrasing | Passed |
| Practice problem generation | Passed |
| End session summary modal | Passed |
| History page shows completed session summary | Passed |

## Notes

- Local QA used `AETHER_DEMO_MODE=true` for deterministic demo behavior.
- Turso credentials are required for database commands after the libSQL adapter change.
- Ollama Cloud unavailable handling is implemented in `lib/ai/tutor-service.ts` and returns the required clear message when demo mode is off.
- Prisma 7 initially produced a blank schema-engine error while creating a first migration directly. A migration was generated from Prisma diff and checked in; `pnpm prisma migrate dev` now reports the database is in sync.

## Remaining Risks

- Browser flow is manually verified, not covered by Playwright test files.
- No auth means guest progress is tied to one browser.
- Real Ollama Cloud quality depends on the selected hosted model and account limits.
