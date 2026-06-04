# Release Memory: TokenOPS
_Last updated: 2026-06-04_

## Current Status

TokenOPS is a CLI/API/dashboard for AI cost optimization, context compression, and token savings tracking. It optionally uses LeanCTX.

## Release Target

Local developer tool or hosted API/dashboard after verification.

## Success Criteria

- Dependencies install cleanly.
- `pnpm build` passes.
- CLI works on a fixture file.
- API and dashboard run locally.
- LeanCTX fallback behavior is documented and tested.
- OpenAI/API key errors are safe and clear.

## Ordered Plan

1. Install dependencies.
2. Run `pnpm build` and lint if configured.
3. Test CLI on a small fixture file.
4. Start API and dashboard locally.
5. Test with and without LeanCTX binary.
6. Document deployment path if hosting API/dashboard.
7. Prepare release notes.

## Risks

- External AI costs need guardrails.
- LeanCTX setup can be a user friction point.
- Hosted API needs auth and rate limiting before public production.

## First Task

Run build and verify CLI fallback without LeanCTX.

## Latest Prep Notes

- Updated `.env.example` to use `YOUR_OPENAI_API_KEY` and `YOUR_ANTHROPIC_API_KEY` instead of fake key-shaped values.
- Current release type remains POC/local tool until build, CLI fixture, API/dashboard, and LeanCTX fallback are verified.
- Polished README with POC/local status, technical decisions, setup, verification, known limits, and hosted API blockers.
