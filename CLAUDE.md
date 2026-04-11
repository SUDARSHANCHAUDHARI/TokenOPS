# TokenOps — Claude Code Context

## App Overview
TokenOps is an AI cost optimization and workflow engine for developers.
It wraps LeanCTX (open-source context compression) and adds:
- AI agents (debug, test, review) that use compressed context
- CLI tool (`tokenops debug <file>`)
- REST API (Fastify, port 3001)
- Web dashboard (Next.js, port 3000)
- Token usage analytics

## Platform
Web / Node.js (TypeScript monorepo)

## Monorepo Structure
- apps/web       → Next.js dashboard (port 3000)
- apps/api       → Fastify API server (port 3001)
- apps/cli       → CLI binary (`tokenops`)
- packages/core  → LeanCTX wrapper + token estimator
- packages/agents → DebugAgent, TestAgent, ReviewAgent
- packages/analytics → TokenTracker, cost reporting
- services/context-engine → leanctx binary (not committed)

## Tech Stack
- TypeScript everywhere
- TurboRepo for monorepo orchestration
- Fastify for API
- Next.js 15 + Tailwind v4 for web
- OpenAI SDK for LLM calls

## Current Version
1.0.0

## Key Features
- Compress code context via LeanCTX before sending to LLM
- Debug, test-generation, and review agents
- Token savings analytics per session
- CLI + API + dashboard all connected

## Known Issues / In Progress
- LeanCTX binary must be built/downloaded separately (see services/context-engine/README.md)
- Falls back to raw file content if binary not found

## Privacy Policy
https://sudarshanchaudhari.github.io/tokenops-privacy-policy/
