# context-engine

This folder is where the LeanCTX binary lives.

## Download

LeanCTX is open-source (MIT): https://github.com/yvgude/lean-ctx

Build from source (requires Rust):
```bash
git clone https://github.com/yvgude/lean-ctx
cd lean-ctx
cargo build --release
cp target/release/leanctx ../../services/context-engine/leanctx
```

Or download a pre-built release binary and place it here as `leanctx`.

## Usage by TokenOps

The `@tokenops/core` package calls:
```
leanctx compress <file>
```

It searches for the binary in this order:
1. `LEANCTX_PATH` environment variable
2. `services/context-engine/leanctx` (this folder)
3. System PATH

If the binary is not found, TokenOps falls back to sending raw file content
(no compression) so the pipeline still works during development.

## macOS gatekeeper

If macOS blocks the binary:
```bash
xattr -c services/context-engine/leanctx
chmod +x services/context-engine/leanctx
```
