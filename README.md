# CodeGuardian

**An AI debugging IDE for broken repositories — diagnose reproducible failures, apply minimal verified repairs, and generate repair reports.**

## Problem

Developers waste hours on reproducible failures — broken imports, type mismatches, failing tests, and build errors — often with AI tools that suggest broad rewrites instead of targeted fixes.

## Solution

CodeGuardian is a professional IDE-style debugging environment. Clone a repository, run diagnostics, chat with Guardian about specific errors, preview minimal patches, apply fixes after review, rerun verification, and view a repair audit report.

## Product Principle

CodeGuardian is a debugger, not a software engineer.

It does not build new features, redesign applications, or make broad architectural changes. It focuses on reproducible software failures, minimal safe patches, verification, and clear repair reports.

No fix is complete until it is verified.

## IDE-Style Product Identity

CodeGuardian feels like a focused AI debugging IDE — similar in seriousness to VS Code, Cursor, or GitHub Codespaces — not a generic SaaS dashboard. The main experience is a full-screen workspace with file explorer, Monaco editor, diagnostics panel, Guardian chat, and verification terminal.

## Core Workflow

**Clone → Diagnose → Minimal Patch → Verify → Report**

1. Load or clone a repository
2. Run diagnostic commands (`typecheck`, `test`, `build`)
3. Review detected issues and root causes
4. Preview and apply minimal patches within repair boundaries
5. Rerun verification commands
6. Generate a repair audit report

## Features

- Firebase Authentication (email/password + Google)
- IDE-style workspace with Monaco Editor
- Mock demo repository with intentional bugs
- Mock diagnostics engine
- Guardian Chat UI (OpenAI integration planned)
- Mock repair workflow with diff preview
- Mock verification runner
- Repair report modal
- 4 themes: Guardian Dark, Midnight, Light, High Contrast

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Editor:** Monaco Editor (`@monaco-editor/react`)
- **Auth:** Firebase Authentication (npm SDK, auth only)
- **AI (planned):** OpenAI GPT-5.6 via server-side API routes
- **Icons:** Lucide React

## Firebase Auth Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → your project (`codeguardian-2026`)
2. **Authentication → Sign-in method:**
   - Enable **Email/Password**
   - Enable **Google** (optional, for Google sign-in)
3. **Authentication → Settings → Authorized domains:**
   - Add `localhost` for local development
4. Copy your Firebase web config into `.env.local` (see below)

> **Important:** This MVP uses Firebase Authentication only. No Firestore, Realtime Database, or Storage.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase web config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENAI_API_KEY=
```

## How to Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # ESLint
```

## Current MVP

The current version includes:
- Firebase Authentication
- IDE-style CodeGuardian workspace
- Mock demo repository
- Mock diagnostics
- Mock Guardian Chat
- Mock repair flow
- Mock diff preview
- Mock verification result
- Repair report UI

Upcoming:
- Real GitHub repository cloning
- Real command diagnostics
- GPT-5.6 repair planning
- Patch application
- Verification runner
- Markdown report export

## Planned GPT-5.6 / OpenAI Integration

Guardian Chat and repair planning will connect to OpenAI GPT-5.6 through **server-side API routes only**. The `OPENAI_API_KEY` environment variable will never be exposed to the frontend.

## Planned Repo Cloning and Diagnostics Engine

Future milestones will add real GitHub repository cloning, sandboxed command execution (`npm run typecheck`, `npm test`, `npm run build`), and live patch application with verification reruns.

## Hackathon Judging Notes

- **Developer Tools track:** CodeGuardian is a debugging IDE, not a code generator
- **Product differentiation:** "Debug, do not build" — minimal patches with verification
- **Demo flow:** Sign in → Load Demo Repo → Diagnose → Fix issue → Verify → View report
- **Professional UI:** Full-screen IDE layout with themes, Monaco editor, and repair workflow

## How Codex was used

Codex was used to scaffold the application, build the authenticated IDE-style workspace, implement the Firebase Authentication flow, design the debugging workflow UI, create the mock repair pipeline, and prepare the project for the GPT-5.6 repair engine.

Primary Codex /feedback Session ID: [PASTE_SESSION_ID_HERE]

## License

MIT
