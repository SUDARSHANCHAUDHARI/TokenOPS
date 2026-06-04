# TokenOPS

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15-F69220.svg)](https://pnpm.io/)
[![Release](https://img.shields.io/badge/release-POC%20local%20tool-orange.svg)](RELEASE_MEMORY.md)

AI cost optimization and workflow engine for developers. TokenOPS explores context compression, AI agent workflows, API access, and a dashboard for token savings.

> **Status:** POC/local tool · not release-ready until build, CLI fixture, API/dashboard, and LeanCTX fallback behavior are verified

## Why This Exists

AI coding workflows can become expensive because prompts grow, files repeat, and models receive unnecessary context. TokenOPS is an experiment in compressing context, running useful agents on the smaller payload, and tracking token savings.

## Status

| Item | State |
|---|---|
| Release type | POC/local tool |
| Build | Pending latest verification |
| CLI fixture | Pending |
| API/dashboard | Pending local smoke |
| LeanCTX fallback | Pending verification |

## Key Technical Decisions

**LeanCTX is optional.** Compression is valuable, but the tool should still have a clear fallback path when the external binary is missing.

**CLI, API, and dashboard live in one workspace.** The same token-saving concepts can be used from scripts, services, or a visual dashboard.

**OpenAI key handling stays explicit.** `.env.example` uses `YOUR_*` placeholders and release work should verify missing-key errors are clear.

**Hosted API needs auth and rate limits before public production.** Token and cost tooling can expose sensitive code context, so hosting must wait for security hardening.

## Features

- context compression concept
- debug/test/review agent commands
- REST API concept
- dashboard concept
- token savings tracking
- optional LeanCTX integration

## Setup

```bash
pnpm install
cp .env.example .env
```

Environment:

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
```

## Run

```bash
pnpm build
```

CLI examples after build:

```bash
node apps/cli/dist/index.js debug path/to/file.ts
node apps/cli/dist/index.js test path/to/file.ts
node apps/cli/dist/index.js review path/to/file.ts
```

## Verification

Before release:

```bash
pnpm build
pnpm lint
```

Then verify:

- CLI on a tiny fixture file
- API local server
- dashboard local server
- behavior with and without LeanCTX

## Known Limits

- LeanCTX setup can be user friction.
- Build/API/dashboard verification is still pending.
- Hosted API requires auth and rate limits before public use.
- Token-cost claims need measured fixtures before marketing.

## Author

Built by **Sudarshan Chaudhari** — SudarshanTechLabs.
