"use strict";
// Runs the built CLI (apps/cli/dist/index.js) as a child process in an empty temp cwd, so no .env is picked up.
// Only paths that never reach the OpenAI API are exercised (usage, arg errors, missing key, missing file, analytics).
const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { REPO, tmpDir, rmDir } = require("./helpers.js");

const CLI = path.join(REPO, "apps/cli/dist/index.js");

describe("tokenops CLI", () => {
  let cwd;
  beforeEach(() => { cwd = tmpDir(); });
  afterEach(() => rmDir(cwd));

  function run(args, env = {}) {
    const r = spawnSync(process.execPath, [CLI, ...args], {
      cwd,
      encoding: "utf8",
      timeout: 15_000,
      // Minimal env: no inherited OPENAI_API_KEY / LEANCTX_PATH.
      env: { PATH: process.env.PATH, HOME: cwd, ...env },
    });
    assert.equal(r.error, undefined, String(r.error));
    return { code: r.status, out: r.stdout, err: r.stderr };
  }

  for (const flag of [[], ["--help"], ["-h"]]) {
    it(`prints usage and exits 0 for args [${flag.join(" ")}]`, () => {
      const { code, out } = run(flag);
      assert.equal(code, 0);
      assert.match(out, /tokenops debug <file>/);
      assert.match(out, /tokenops analytics/);
    });
  }

  it("exits 1 with 'file path required' when a command has no file", () => {
    const { code, err } = run(["debug"]);
    assert.equal(code, 1);
    assert.match(err, /Error: file path required\./);
    assert.match(err, /Usage:/);
  });

  it("exits 1 with 'Unknown command' for an unrecognised command", () => {
    const { code, err } = run(["explode", "file.ts"], { OPENAI_API_KEY: "sk-test" });
    assert.equal(code, 1);
    assert.match(err, /Unknown command: explode/);
  });

  // apps/cli/src/index.ts:73-79: agentMap is a plain object, so inherited keys ("constructor", "toString") look like commands.
  it("rejects 'constructor' as an unknown command", () => {
    const { code, err } = run(["constructor", "file.ts"], { OPENAI_API_KEY: "sk-test" });
    assert.equal(code, 1);
    assert.match(err, /Unknown command: constructor/);
  });

  it("exits 1 when OPENAI_API_KEY is not set", () => {
    const { code, err } = run(["debug", "file.ts"]);
    assert.equal(code, 1);
    assert.match(err, /Error: OPENAI_API_KEY environment variable is required/);
  });

  for (const cmd of ["debug", "test", "review"]) {
    it(`'${cmd}' on a missing file exits 1 with 'File not found' (before any API call)`, () => {
      const { code, err, out } = run([cmd, "missing.ts"], { OPENAI_API_KEY: "sk-test" });
      assert.equal(code, 1);
      assert.match(out, new RegExp(`Running ${cmd} agent on missing.ts`));
      assert.match(err, /Error: File not found: missing\.ts/);
    });
  }

  it("'analytics' on a fresh process reports zero usage and exits 0", () => {
    const { code, out } = run(["analytics"]);
    assert.equal(code, 0);
    assert.match(out, /Total tokens used:\s+0\n/);
    assert.match(out, /Total tokens saved:\s+0 \(0%\)/);
    assert.match(out, /Estimated savings:\s+\$0\.0000 USD/);
    assert.doesNotMatch(out, /Runs:/);
  });
});
