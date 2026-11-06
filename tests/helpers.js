"use strict";
// Shared test helpers. Everything here is local, deterministic, and writes only to OS temp dirs.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const REPO = path.resolve(__dirname, "..");

function tmpDir(prefix = "tokenops-test-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function rmDir(dir) {
  // Only ever remove something we created under the OS temp dir.
  if (dir && path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Write an executable shell script that stands in for the leanctx binary. */
function fakeLeanctx(dir, body) {
  const bin = path.join(dir, "leanctx");
  fs.writeFileSync(bin, `#!/bin/sh\n${body}\n`, { mode: 0o755 });
  return bin;
}

/** Run fn with env vars temporarily set (undefined deletes), then restore. */
async function withEnv(vars, fn) {
  const saved = {};
  for (const k of Object.keys(vars)) saved[k] = process.env[k];
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return await fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

module.exports = { REPO, tmpDir, rmDir, fakeLeanctx, withEnv };
