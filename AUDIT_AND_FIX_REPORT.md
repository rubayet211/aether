# Aether — Audit & Fix Report

_Date: 2026-06-14 · Branch: `main` · Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Zustand, Prisma 7 + libSQL/Turso, Ollama Cloud, Zod, Vitest._

---

## 1. Executive summary

Aether already compiled cleanly (typecheck, lint, and 8 unit tests passed on a fresh checkout), so the defects were **runtime / logic / sequencing bugs**, not build breakage. The audit focused on the critical learner journey: assessment → progress init → dashboard → session start → tutor chat → practice → end session → history.

The most important problems found and fixed:

- **Duplicate requests from double-clicks / stale `loading` closures** on Start Session, Assessment submit, and every tutor action button. State-based `disabled` only applies after a re-render, so two fast clicks fired two requests (e.g. two sessions). Fixed with synchronous `useRef` request locks.
- **No transactional integrity** on multi-step writes (assessment+progress, tutor reply+progress, end-session+progress). A partial failure could leave a user with an assessment but incomplete progress, or advanced mastery with no saved reply. Wrapped in `prisma.$transaction`.
- **End Session was not idempotent** — re-ending regenerated the summary and re-applied the mastery bump, corrupting data. Now returns the saved summary unchanged and the tutor endpoint rejects messages to an ended session (409).
- **UI could lock permanently** on a network failure (no `try/catch/finally`; `setLoading(false)` was skipped when `fetch` threw). All async handlers now reset state in `finally` and support safe retry.
- **Hardcoded `masteryScore: 35`** in practice generation, and **demo problems always returned Newton's Second Law content** regardless of topic. Practice now uses the real per-topic mastery (seeded from the DB, advanced live by tutor replies), and demo problems are topic-aware across all 8 topics.

A scripted end-to-end run against the real Turso DB (demo mode, for determinism) passed all 21 journey assertions, including concurrent tutor submits, idempotent end, and post-end blocking.

**Message ordering note:** I verified empirically that Prisma generates `createdAt` with **millisecond precision app-side** (not second-precision SQLite `CURRENT_TIMESTAMP`), and the app writes messages with sequential awaits separated by DB round-trips. Ordering by `createdAt` is therefore reliable, so **no schema/migration change was needed** — avoiding a risky migration.

---

## 2. Commands run

```bash
pnpm run typecheck     # tsc --noEmit            -> clean
pnpm run lint          # eslint                  -> clean
pnpm test              # vitest run              -> 24 passed (was 8)
pnpm run build         # next build              -> success, 13 routes
pnpm tsx scripts/_probe.ts   # (throwaway) verified createdAt precision, then deleted
pnpm tsx scripts/_smoke.ts   # (throwaway) full journey vs Turso, 21/21 PASS, then deleted
```

The repo uses **pnpm** (confirmed via `pnpm-lock`/`.pnpm` store). Turso and Ollama credentials were present in `.env`; `AETHER_DEMO_MODE=false`.

---

## 3. Bugs found

| # | Area | File | Bug | Class | Severity |
|---|------|------|-----|-------|----------|
| 1 | Session start | `app/tutor/page.tsx` | Fast double-click creates 2 sessions; only `disabled={loading}` (applies after re-render) guarded it. | Duplicate request / race | Critical |
| 2 | Tutor chat | `components/tutor/chat-interface.tsx` | `if (!content \|\| loading) return` relies on stale `loading` closure; rapid clicks / Enter+click / action-button spam fire duplicate tutor calls. | Race / duplicate | Critical |
| 3 | Tutor chat | `components/tutor/chat-interface.tsx` | No `try/catch/finally`; a thrown `fetch` skips `setLoading(false)` → UI locked forever. | UI state / missing error state | High |
| 4 | End session | `app/api/sessions/[sessionId]/route.ts` | Not idempotent — re-ending regenerates summary and re-applies mastery; no 404 for missing session; summary+progress not transactional. | DB consistency / functional | High |
| 5 | Tutor API | `app/api/tutor/route.ts` | Message saves + progress upsert not transactional; ended sessions still accepted new turns. | DB consistency | High |
| 6 | Assessment API | `app/api/assessment/route.ts` | User+assessment+progress writes not transactional; partial failure → broken dashboard. | DB consistency | High |
| 7 | Practice | `components/tutor/chat-interface.tsx` | Hardcoded `masteryScore: 35` sent to `/api/problems`. | MVP completeness / functional | Medium |
| 8 | Practice (demo) | `lib/ai/demo-responses.ts` | `demoProblems` ignored the topic — always Newton's Second Law content. | Functional | Medium |
| 9 | Assessment UI | `app/assessment/page.tsx` | No double-submit guard; no `try/catch/finally`. | Race / UI state | Medium |
| 10 | Tutor input | `components/tutor/tutor-input.tsx` | Enter submitted even when `disabled` or empty. | UI state | Low |
| 11 | Problems API | `app/api/problems/route.ts` | Did not validate the user exists before generating/saving. | API validation | Low |
| 12 | Practice UI | `components/tutor/chat-interface.tsx` | `key={problem.question}` could collide → React duplicate-key warning. | UI state | Low |

Verified **not** broken (checked, no change needed): `localStorage` is only read in client event handlers / `useEffect` (no SSR access); progress upserts already use the correct `userId_topicId` unique key; `estimateMasteryUpdate` already clamps 0–100; demo mode already short-circuits before any Ollama call (missing `OLLAMA_API_KEY` does not break demo mode); `response-parser` already strips markdown fences; session history already ordered by `startedAt desc`; the JSON `jsonOk`/`jsonError` envelope is already consistent; the problem generator already retries once on invalid JSON.

---

## 4. Bugs fixed

1. **Start Session lock (#1)** — `startingRef` ref guard; validates `session.id` before navigating; keeps the button locked through navigation; `try/catch` resets on network error.
2. **Tutor request lock (#2)** — single `busyRef` guards all four actions (message/hint/explain/practice) plus end-session, blocking duplicates synchronously before re-render.
3. **Resilient handlers (#3)** — all chat handlers use `try/catch/finally`; `finally` releases `busyRef` and clears `loading`. **Safe retry**: on failure the optimistic student bubble is rolled back and the draft restored to the input.
4. **Idempotent end + 404 + transaction (#4)** — if `endedAt` is already set, returns the saved summary with `alreadyEnded: true` (no regeneration, no mastery re-apply); missing session → 404; summary update + progress upsert wrapped in `$transaction`.
5. **Tutor transaction + ended guard (#5)** — student message saved first (so AI context includes it), AI call runs outside any transaction, then assistant message + progress upsert commit atomically. Messages to an ended session → 409.
6. **Assessment transaction (#6)** — user upsert/create + `currentLevel` + assessment + all 8 progress upserts run in one `$transaction`.
7. **Real mastery (#7)** — `ChatInterface` takes a `masteryScore` prop seeded from the DB by the server page, tracks it in state, and advances it from each tutor reply's `updatedProgress.mastery`; practice generation sends the live value.
8. **Topic-aware demo problems (#8)** — `demoProblems` matches the topic name to per-topic templates (all 8 topics) with a generic fallback.
9. **Assessment submit guard (#9)** — `submittingRef` + `try/catch/finally`.
10. **Enter key guard (#10)** — Enter only submits when not disabled and non-empty.
11. **Problems user validation (#11)** — 404 when the user does not exist.
12. **Stable keys (#12)** — problem list keyed by `question + index`.

---

## 5. Files changed

| File | Change |
|------|--------|
| `app/api/tutor/route.ts` | Ended-session 409 guard; student-first save; assistant+progress in `$transaction`. |
| `app/api/sessions/[sessionId]/route.ts` | 404 for missing; idempotent re-end; finalize+progress in `$transaction`. |
| `app/api/assessment/route.ts` | All writes in one `$transaction`. |
| `app/api/problems/route.ts` | Validate user existence (404). |
| `app/tutor/page.tsx` | `startingRef` lock, id validation, error handling. |
| `app/tutor/[sessionId]/page.tsx` | Load topic mastery and pass `masteryScore`. |
| `app/assessment/page.tsx` | `submittingRef` lock + `try/catch/finally`. |
| `components/tutor/chat-interface.tsx` | `busyRef` lock, resilient handlers, safe retry, live mastery, ended state, stable keys. |
| `components/tutor/tutor-input.tsx` | Guard Enter when disabled/empty. |
| `lib/ai/demo-responses.ts` | Topic-aware demo problem templates. |

New test files: `tests/demo-problems.test.ts`, `tests/mastery-clamp.test.ts`, `tests/validators.test.ts`; extended `tests/response-parser.test.ts`.

No dependencies added. No schema/migration change. No product/feature changes.

---

## 6. Tests added or updated

- **`tests/demo-problems.test.ts`** — demo problems adapt to topic; differ across topics; valid fallback for unknown topic; satisfy the generated-problem shape.
- **`tests/mastery-clamp.test.ts`** — mastery clamps at 100 (high start) and ≥ 0; demo summary estimate clamps at 100.
- **`tests/validators.test.ts`** — empty tutor message rejected; default action applied; mastery out-of-range rejected; end flag required; `jsonError` → 400 with issues for ZodError, custom 404 status, consistent success envelope.
- **`tests/response-parser.test.ts`** (extended) — fenced-markdown tutor JSON parsed; clean failure when no JSON present.

Result: **24 tests pass** (up from 8).

In addition, a throwaway scripted journey (`scripts/_smoke.ts`, deleted after use) exercised the real handlers + Turso DB in demo mode and asserted: assessment ok + userId; progress initialized for all 8 topics; session + exactly one welcome message; two concurrent tutor turns both saved (2 student / 3 assistant, 5 total, correctly ordered); mastery advanced with `attempts == 2`; topic-aware practice generated; end-session saves summary/takeaways/`endedAt`; re-end idempotent (`alreadyEnded`); tutor blocked after end (409); history shows the completed session; invalid payload → 400; missing user → 404. **21/21 PASS.**

---

## 7. Verification results

| Check | Result |
|-------|--------|
| `pnpm run typecheck` | ✅ clean |
| `pnpm run lint` | ✅ clean |
| `pnpm test` | ✅ 24/24 |
| `pnpm run build` | ✅ success (13 routes) |
| E2E smoke (real Turso, demo mode) | ✅ 21/21 |

---

## 8. Remaining risks

- **Student vs. assistant atomicity:** the student message is saved before the AI call (the AI needs it as context), so only the assistant reply + progress are in one transaction. Holding a transaction open across a multi-second AI call would lock the DB, so this is the correct trade-off. Impact of a failure: an orphan student message remains and the user can retry — no corruption.
- **Concurrency at the API:** server endpoints intentionally do not dedupe distinct concurrent requests (the client ref-lock prevents resubmitting the *same* message). Two *different* genuine messages sent in parallel will both be saved, which is correct. There is no server-side rate limit (out of scope for MVP).
- **Live Ollama path not exercised in CI:** demo mode is deterministic and fully covered; the real Ollama Cloud path depends on network/credentials and was validated by code review of the fallback/retry/parse logic, not a live call.
- **Guest identity is `localStorage`-only:** clearing storage or switching browsers loses the profile. Intentional for MVP (no auth requested).
- **`prisma.$transaction` over the libSQL adapter:** interactive transactions worked in the smoke run; under heavy serverless concurrency, long transactions could contend. Current transactions are short.

---

## 9. MVP completeness score

**92 / 100.**

Full journey works end to end and is verified against the real DB; double-submit, sequencing, idempotency, transactions, real mastery, topic-aware practice, and error handling are all fixed. Points withheld for: no authentication (guest-only), no server-side rate limiting, and the live-AI path being validated by review rather than an automated live test.

---

## 10. Manual QA checklist for the owner

> Run with real credentials: `pnpm install`, ensure `.env` has `TURSO_*` and `OLLAMA_*`, then `pnpm run build && pnpm start` (or `pnpm dev`). To test without AI cost, set `AETHER_DEMO_MODE=true`.

1. **Landing** → `/` loads; "Start Learning" → `/assessment`.
2. **Assessment** → answer all 7; on the last step click **Submit** rapidly twice → only one result; refresh-safe `aetherUserId` is stored (DevTools → Application → Local Storage).
3. **Dashboard** → `/dashboard` shows level, recommended topic, mastery map for **all 8 topics**, weak areas, recent sessions.
4. **Missing profile** → clear `aetherUserId`, open `/dashboard` and `/history` → friendly "complete the diagnostic" message, not a crash.
5. **Start session** → `/tutor`, double-click **Start session** fast → exactly **one** session opens (check `/history` count).
6. **Welcome message** → session opens with exactly one assistant welcome bubble.
7. **Send a message** → type, press **Enter** and click **Send** together → only one student bubble + one reply; input is disabled while "Aether is thinking…".
8. **Sequencing** → send, and while it's thinking try to send again / spam Hint/Explain → blocked until the reply returns.
9. **Retry** → (toggle offline in DevTools) send → error shown, the student bubble is removed and your text is restored; go back online and resend works.
10. **Practice** → click **Generate Practice** → problems match the **current topic** (not always Newton's Second Law); shown once.
11. **End session** → click **End Session** → summary modal with takeaways + misconceptions; button becomes "Session ended" and chat input disabled.
12. **Idempotency** → reopen the ended session URL and try to send → blocked; ending again does not change the summary.
13. **History** → `/history` shows the session as **Completed** with summary, takeaways, misconceptions, ordered newest first.
14. **Progress refresh** → return to `/dashboard` → the practiced topic's mastery reflects the session.
15. **Validation** → (optional) `POST /api/tutor` with empty `userMessage` → 400; `POST /api/sessions` with a bogus `userId` → 404.
