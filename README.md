# Aether

**Deep understanding, not just answers.**

Aether is an AI-powered STEM tutor MVP for high-school Physics. It focuses on Mechanics and Newton's Laws, guiding students through reasoning instead of acting like a generic answer bot.

## Problem

Students often get final answers from AI without learning the reasoning. That hides misconceptions around forces, acceleration, free body diagrams, friction, weight, work, and energy.

## Solution

Aether creates a diagnostic learning profile, recommends a starting topic, and runs Socratic tutoring sessions that ask one guiding question at a time. It saves messages, progress, practice problems, and session summaries.

## MVP Features

- Guest diagnostic onboarding with 7 Physics questions
- Learning profile with level, weak areas, mastery map, and recommended topic
- Socratic tutor chat with Guided Reasoning, Practice Problem, and Explain Concept modes
- Hint, explain, practice generation, and end-session summary actions
- Ollama Cloud integration with API-key auth and model/fallback config
- Demo mode for reliable hackathon presentation without cloud credentials
- Prisma + Turso/libSQL persistence for users, topics, assessments, sessions, messages, problems, and progress
- Session history with takeaways, misconceptions, and recommendations

## Tech Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, shadcn-style local UI primitives, lucide-react, Framer Motion
- Prisma 7, Turso/libSQL, Zod
- Ollama Cloud inference via `https://ollama.com/api`
- Zustand for tutor UI state
- Vitest for deterministic core logic tests

## Architecture

```text
app/
  pages + route handlers
components/
  UI, layout, assessment, dashboard, tutor, problem, shared states
lib/
  assessment logic
  ai prompts + Ollama client + services + parsers
  api validators/responses
  progress rules
  Prisma client
prisma/
  schema, migrations, seed
```

```text
Client UI -> Next Route Handler -> Zod validation -> Service layer
                                         |
                                         +-> Prisma Turso/libSQL
                                         +-> AI orchestration -> Ollama Cloud or demo fallback
```

## Local Setup

```bash
pnpm install
pnpm prisma generate
pnpm turso:schema
pnpm prisma db seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env`:

```env
TURSO_DATABASE_URL="libsql://aether-db-yourusername.turso.io"
TURSO_AUTH_TOKEN="your-generated-auth-token-string"
OLLAMA_BASE_URL="https://ollama.com"
OLLAMA_API_KEY="your-ollama-cloud-api-key"
OLLAMA_MODEL="gpt-oss:120b"
OLLAMA_FALLBACK_MODEL=""
AETHER_DEMO_MODE="false"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For a no-cloud demo:

```env
AETHER_DEMO_MODE="true"
```

## Ollama Cloud Setup

Create an Ollama API key at [ollama.com/settings/keys](https://ollama.com/settings/keys), set `OLLAMA_API_KEY`, and choose a cloud model such as `gpt-oss:120b`.

If Ollama Cloud is unavailable and demo mode is off, Aether returns:

```text
Aether cannot reach Ollama Cloud. Check OLLAMA_API_KEY, OLLAMA_BASE_URL, and OLLAMA_MODEL.
```

## Turso Database

Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, then push and seed the schema:

```bash
pnpm turso:schema
pnpm prisma db seed
```

`pnpm turso:schema` applies the checked-in Prisma migration SQL through the LibSQL client. This avoids Prisma schema-engine failures seen with `prisma db push` against Turso in the current Prisma 7 setup.

## Demo Flow

1. Open landing page.
2. Click **Start Learning**.
3. Complete diagnostic assessment.
4. Open dashboard and review level, weak areas, and mastery map.
5. Start tutoring.
6. Send a misconception-like answer such as “moving means there must be a force keeping it moving.”
7. Generate practice.
8. End session and review summary.
9. Open history.

## Known Limitations

- Guest identity is stored in browser `localStorage`; no real authentication.
- MVP focuses on high-school Mechanics; electricity is intentionally deferred.
- Ollama Cloud streaming is not exposed in UI yet; non-streaming generation is used.
- Demo mode uses realistic deterministic responses, not full model reasoning.

## Roadmap

- Real auth and student accounts
- Teacher/parent progress view
- More Physics topics and other STEM subjects
- Streaming tutor responses
- Rich diagrams for free body diagrams
- Stronger automated API and browser tests

## Hackathon Judging Alignment

- Clear product differentiation: reasoning tutor, not answer chatbot
- End-to-end working student journey
- Local AI support with demo fallback
- Persistent progress and session history
- Polished, accessible, responsive UI
