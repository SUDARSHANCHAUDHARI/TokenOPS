# TokenOps

> Control your AI costs. Maximize output.

TokenOps is an AI cost optimization and workflow engine that sits between your code and LLMs.
It compresses context using [LeanCTX](https://github.com/yvgude/lean-ctx), runs AI agents on the compressed output, and tracks token savings.

## Features

- **Context compression** — reduce tokens 60–99% via LeanCTX
- **AI agents** — debug, test generation, code review
- **CLI** — `tokenops debug src/server.ts`
- **REST API** — `POST /analyze` for programmatic access
- **Dashboard** — Next.js UI with token savings stats
- **Analytics** — per-session cost tracking

## Quick Start

### Prerequisites
- Node.js 20+
- OpenAI API key
- LeanCTX binary (optional — falls back to raw content)

### Install

```bash
pnpm install
```

### Configure

```bash
cp .env.example .env
# edit .env and add your OPENAI_API_KEY
```

### Build

```bash
pnpm build
```

### Run API server

```bash
cd apps/api && pnpm dev
```

### Run web dashboard

```bash
cd apps/web && pnpm dev
```

Open http://localhost:3000

### Use the CLI

```bash
# from monorepo root after build
node apps/cli/dist/index.js debug path/to/file.ts
node apps/cli/dist/index.js test path/to/file.ts
node apps/cli/dist/index.js review path/to/file.ts
```

Or install globally:
```bash
pnpm install -g ./apps/cli
tokenops debug src/server.ts
```

## LeanCTX Setup (optional but recommended)

```bash
git clone https://github.com/yvgude/lean-ctx
cd lean-ctx
cargo build --release
cp target/release/leanctx ../TokenOPS/services/context-engine/leanctx
```

See [services/context-engine/README.md](services/context-engine/README.md) for details.

## Architecture

```
CLI / Web Dashboard
        ↓
   Fastify API
        ↓
   Agent Layer
  (debug/test/review)
        ↓
 @tokenops/core
  (LeanCTX wrapper)
        ↓
  LeanCTX binary
        ↓
  OpenAI / Claude
        ↓
  Analytics tracker
```

## License

MIT — SudarshanTechLabs
