Deployed Link: https://is219airesearchassistant.vercel.app/

# AI Research Assistant

A production-oriented Next.js application for chatting with uploaded PDF documents using semantic retrieval and AI-generated responses.

## Overview

AI Research Assistant lets users:

- Upload PDF documents.
- Process documents into chunks and embeddings.
- Ask questions in a chat interface grounded in document context.
- Save and revisit chat sessions.
- Browse a component/showcase area for UI examples.

Core stack:

- Next.js (App Router)
- React + TypeScript
- Supabase (storage + database)
- OpenAI API (embeddings + chat generation)
- Jest + Testing Library

## Project Structure

Key areas:

- `src/app/api/*`: API routes for upload, retrieval, chat, documents, and saved chats.
- `src/features/*`: Chat, upload, saved chat, and showcase UI features.
- `src/lib/openai/*`: OpenAI chat and embeddings clients.
- `src/lib/retrieval/*`: Context retrieval logic.
- `src/lib/supabase/*`: Browser/server Supabase clients.
- `src/hooks/*`: Reusable hooks, including chat behavior.

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project (URL, anon key, service role key)
- An OpenAI API key

## Environment Variables

Create a `.env.local` file in the `ai-research-assistant` directory and set:

```bash
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Notes:

- `NEXT_PUBLIC_*` variables are exposed to the browser.
- Keep service and API keys private.
- Do not commit `.env.local`.

## Install Dependencies

From the project root:

```bash
cd ai-research-assistant
npm install
```

## Run the Project (Development)

```bash
npm run dev
```

Then open:

- `http://localhost:3000`

Useful scripts:

- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint checks

## Run Tests

This project uses Jest + Testing Library.

Run all tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage report:

```bash
npm run test:coverage
```

## Typical Development Flow

1. Start Supabase and ensure env vars are set.
2. Run `npm install`.
3. Run `npm run dev`.
4. Upload a PDF and test chat retrieval.
5. Run `npm run lint` and `npm test` before pushing.

## Current State

The app includes:

- Document upload and deletion.
- Chat sessions linked to documents.
- Saved chat workflows.
- Clear PDF context behavior when context is removed or stale.

