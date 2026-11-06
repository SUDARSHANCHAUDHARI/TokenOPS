"use strict";
const { describe, it, beforeEach, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { compressFile, estimateTokens } = require("../packages/core/dist/index.js");
const { REPO, tmpDir, rmDir, fakeLeanctx, withEnv } = require("./helpers.js");

describe("estimateTokens", () => {
  it("is ceil(chars / 4)", () => {
    assert.equal(estimateTokens(""), 0);
    assert.equal(estimateTokens("a"), 1);
    assert.equal(estimateTokens("abcd"), 1);
    assert.equal(estimateTokens("abcde"), 2);
    assert.equal(estimateTokens("x".repeat(400)), 100);
    assert.equal(estimateTokens("x".repeat(401)), 101);
  });
});

describe("compressFile", () => {
  let dir;
  let warn;
  beforeEach(() => {
    dir = tmpDir();
    warn = mock.method(console, "warn", () => {});
  });
  afterEach(() => {
    mock.restoreAll();
    rmDir(dir);
  });

  const writeInput = (text) => {
    const f = path.join(dir, "input.ts");
    fs.writeFileSync(f, text);
    return f;
  };

  it("rejects with 'File not found' for a missing file and never runs the binary", async () => {
    const marker = path.join(dir, "ran");
    const bin = fakeLeanctx(dir, `touch "${marker}"`);
    const missing = path.join(dir, "nope.ts");
    await withEnv({ LEANCTX_PATH: bin }, async () => {
      await assert.rejects(compressFile(missing), { message: `File not found: ${missing}` });
    });
    assert.equal(fs.existsSync(marker), false);
  });

  it("calls $LEANCTX_PATH as `<bin> compress <file>` and returns its trimmed stdout", async () => {
    const f = writeInput("x".repeat(100));
    const bin = fakeLeanctx(dir, 'printf "ARGS[%s|%s|%s]\\n\\n" "$#" "$1" "$2"');
    const r = await withEnv({ LEANCTX_PATH: bin }, () => compressFile(f));
    assert.equal(r.output, `ARGS[2|compress|${f}]`);
    assert.equal(warn.mock.callCount(), 0);
  });

  it("computes char counts and rounded savings percent from the compressed output", async () => {
    const f = writeInput("x".repeat(200));
    const bin = fakeLeanctx(dir, 'printf "%s" "$(printf "y%.0s" $(seq 1 67))"'); // 67 chars
    const r = await withEnv({ LEANCTX_PATH: bin }, () => compressFile(f));
    assert.equal(r.originalChars, 200);
    assert.equal(r.compressedChars, 67);
    assert.equal(r.savingsPercent, 67); // (200-67)/200 = 66.5 -> 67
  });

  it("reports negative savings when the binary output is larger than the input", async () => {
    const f = writeInput("abcd");
    const bin = fakeLeanctx(dir, 'printf "abcdefgh"');
    const r = await withEnv({ LEANCTX_PATH: bin }, () => compressFile(f));
    assert.equal(r.savingsPercent, -100);
  });

  it("falls back to the raw file content and warns when the binary is missing", async () => {
    const f = writeInput("const a = 1;\n");
    const r = await withEnv({ LEANCTX_PATH: path.join(dir, "no-such-binary") }, () => compressFile(f));
    assert.equal(r.output, "const a = 1;\n");
    assert.equal(r.compressedChars, r.originalChars);
    assert.equal(r.savingsPercent, 0);
    assert.equal(warn.mock.callCount(), 1);
    assert.match(String(warn.mock.calls[0].arguments[0]), /leanctx binary not found/);
  });

  it("falls back to the raw file content when the binary exits non-zero", async () => {
    const f = writeInput("hello");
    const bin = fakeLeanctx(dir, "echo partial; exit 3");
    const r = await withEnv({ LEANCTX_PATH: bin }, () => compressFile(f));
    assert.equal(r.output, "hello");
    assert.equal(warn.mock.callCount(), 1);
  });

  it("an empty file yields 0% savings (no NaN)", async () => {
    const f = writeInput("");
    const r = await withEnv({ LEANCTX_PATH: path.join(dir, "no-such-binary") }, () => compressFile(f));
    assert.equal(r.originalChars, 0);
    assert.equal(r.savingsPercent, 0);
  });

  it("LEANCTX_PATH wins over the bundled monorepo binary lookup", async () => {
    const f = writeInput("x".repeat(40));
    const bin = fakeLeanctx(dir, 'printf "from-env"');
    const probes = [];
    const realExists = fs.existsSync;
    mock.method(fs, "existsSync", (p) => (probes.push(String(p)), realExists(p)));
    const r = await withEnv({ LEANCTX_PATH: bin }, () => compressFile(f));
    assert.equal(r.output, "from-env");
    assert.deepEqual(probes, [f]); // only the input file was probed, no leanctx lookup
  });

  // compress.ts:14-17 resolves "../../../../services/context-engine/leanctx" from packages/core/{src,dist},
  // which lands in the parent of the repo. The monorepo's own services/context-engine/leanctx is never found.
  it("looks for the bundled binary at <repo>/services/context-engine/leanctx", async () => {
    const f = writeInput("x".repeat(40));
    const probes = [];
    const realExists = fs.existsSync;
    mock.method(fs, "existsSync", (p) => (probes.push(String(p)), realExists(p)));
    await withEnv({ LEANCTX_PATH: undefined, PATH: dir }, () => compressFile(f)); // PATH=dir: never reach a real leanctx
    assert.ok(
      probes.includes(path.join(REPO, "services", "context-engine", "leanctx")),
      `probed: ${probes.join(", ")}`
    );
  });
});
