# TokenOPS

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15-F69220.svg)](https://pnpm.io/)
[![Release](https://img.shields.io/badge/release-POC%20local%20tool-orange.svg)](RELEASE_MEMORY.md)

AI cost optimization and workflow engine for developers. TokenOPS explores context compression, AI agent workflows, API access, and a dashboard for token savings.

> **Status:** POC/local tool · not release-ready until build, CLI fixture, API/dashboard, and LeanCTX fallback behavior are verified

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Status](#status)
- [Key Technical Decisions](#key-technical-decisions)
- [Features](#features)
- [Setup](#setup)
- [Run](#run)
- [Verification](#verification)
- [Known Limits](#known-limits)
- [About](#about)

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

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
