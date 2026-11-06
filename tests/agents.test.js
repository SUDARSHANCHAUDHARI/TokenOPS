"use strict";
const { describe, it, beforeEach, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const agentsDir = path.resolve(__dirname, "../packages/agents");
const { DebugAgent, TestAgent, ReviewAgent, BaseAgent } = require("../packages/agents/dist/index.js");
const { globalTracker } = require("../packages/analytics/dist/index.js");
// Same module instance the agents use (resolved from the agents package), so the prototype patch is seen.
const OpenAI = require(require.resolve("openai", { paths: [agentsDir] }));
const { tmpDir, rmDir, fakeLeanctx, withEnv } = require("./helpers.js");

describe("agents", () => {
  let dir;
  let create;
  let calls;

  beforeEach(() => {
    dir = tmpDir();
    globalTracker.reset();
    calls = [];
    // Stub the OpenAI network call: record the request, return a canned reply.
    create = mock.method(OpenAI.Chat.Completions.prototype, "create", async function (req) {
      calls.push(req);
      return { choices: [{ message: { content: "canned analysis" } }] };
    });
    mock.method(console, "warn", () => {});
  });
  afterEach(() => {
    mock.restoreAll();
    globalTracker.reset();
    rmDir(dir);
  });

  const input = (text) => {
    const f = path.join(dir, "input.ts");
    fs.writeFileSync(f, text);
    return f;
  };
  const withKey = (fn, extra = {}) => withEnv({ OPENAI_API_KEY: "sk-test", ...extra }, fn);

  describe("construction", () => {
    it("throws when OPENAI_API_KEY is missing", async () => {
      await withEnv({ OPENAI_API_KEY: undefined }, () => {
        assert.throws(() => new DebugAgent(), { message: "OPENAI_API_KEY environment variable is required" });
      });
    });

    it("throws when OPENAI_API_KEY is empty", async () => {
      await withEnv({ OPENAI_API_KEY: "" }, () => {
        assert.throws(() => new TestAgent(), /OPENAI_API_KEY/);
      });
    });

    it("each concrete agent has its own name, system prompt and user prefix", async () => {
      await withKey(() => {
        const agents = [new DebugAgent(), new TestAgent(), new ReviewAgent()];
        for (const a of agents) assert.ok(a instanceof BaseAgent);
        assert.deepEqual(agents.map((a) => a.name), ["debug", "test", "review"]);
        assert.equal(new Set(agents.map((a) => a.systemPrompt)).size, 3);
        assert.equal(new Set(agents.map((a) => a.userPromptPrefix)).size, 3);
      });
    });
  });

  describe("run()", () => {
    it("sends system prompt + prefixed, fenced compressed content to gpt-4o-mini by default", async () => {
      const f = input("x".repeat(400));
      const bin = fakeLeanctx(dir, 'printf "short"');
      await withKey(async () => {
        const agent = new ReviewAgent();
        await agent.run(f);
        assert.equal(create.mock.callCount(), 1);
        assert.equal(calls[0].model, "gpt-4o-mini");
        assert.deepEqual(calls[0].messages, [
          { role: "system", content: agent.systemPrompt },
          { role: "user", content: `${agent.userPromptPrefix}\n\n\`\`\`\nshort\n\`\`\`` },
        ]);
      }, { LEANCTX_PATH: bin });
    });

    it("uses the model passed to the constructor", async () => {
      const f = input("abc");
      await withKey(async () => {
        await new DebugAgent("gpt-4o").run(f);
        assert.equal(calls[0].model, "gpt-4o");
      }, { LEANCTX_PATH: path.join(dir, "missing-bin") });
    });

    it("returns analysis plus token accounting derived from compression", async () => {
      const f = input("x".repeat(400)); // 100 tokens
      const bin = fakeLeanctx(dir, 'printf "%s" "$(printf "y%.0s" $(seq 1 100))"'); // 100 chars -> 25 tokens
      const result = await withKey(() => new DebugAgent().run(f), { LEANCTX_PATH: bin });
      assert.deepEqual(result, {
        agentName: "debug",
        filePath: f,
        analysis: "canned analysis",
        originalTokens: 100,
        compressedTokens: 25,
        savedTokens: 75,
        savingsPercent: 75,
      });
    });

    it("logs the run to globalTracker", async () => {
      const f = input("x".repeat(400));
      const bin = fakeLeanctx(dir, 'printf "%s" "$(printf "y%.0s" $(seq 1 100))"');
      await withKey(() => new TestAgent().run(f), { LEANCTX_PATH: bin });
      const { entries, totalSavedTokens } = globalTracker.report();
      assert.equal(entries.length, 1);
      assert.equal(entries[0].agentName, "test");
      assert.equal(entries[0].filePath, f);
      assert.equal(entries[0].originalTokens, 100);
      assert.equal(entries[0].compressedTokens, 25);
      assert.equal(totalSavedTokens, 75);
    });

    it("clamps savings to 0 when the compressed output is larger than the input", async () => {
      const f = input("abcd"); // 1 token
      const bin = fakeLeanctx(dir, 'printf "%s" "$(printf "y%.0s" $(seq 1 40))"'); // 10 tokens
      const result = await withKey(() => new DebugAgent().run(f), { LEANCTX_PATH: bin });
      assert.equal(result.savedTokens, 0);
      assert.equal(result.savingsPercent, 0);
      assert.equal(result.compressedTokens, 10);
    });

    it("reports 0% for an empty file (no divide by zero)", async () => {
      const f = input("");
      const result = await withKey(() => new DebugAgent().run(f), { LEANCTX_PATH: path.join(dir, "missing-bin") });
      assert.equal(result.originalTokens, 0);
      assert.equal(result.savingsPercent, 0);
    });

    it("falls back to '(no response)' for empty choices and for null content", async () => {
      const f = input("abc");
      await withKey(async () => {
        create.mock.mockImplementationOnce(async () => ({ choices: [] }));
        assert.equal((await new DebugAgent().run(f)).analysis, "(no response)");
        create.mock.mockImplementationOnce(async () => ({ choices: [{ message: { content: null } }] }));
        assert.equal((await new DebugAgent().run(f)).analysis, "(no response)");
      }, { LEANCTX_PATH: path.join(dir, "missing-bin") });
    });

    it("rejects on a missing file before calling the API or logging usage", async () => {
      await withKey(async () => {
        await assert.rejects(new DebugAgent().run(path.join(dir, "gone.ts")), /File not found/);
      });
      assert.equal(create.mock.callCount(), 0);
      assert.equal(globalTracker.report().entries.length, 0);
    });

    it("propagates API errors to the caller", async () => {
      const f = input("abc");
      create.mock.mockImplementationOnce(async () => {
        throw new Error("429 rate limited");
      });
      await withKey(async () => {
        await assert.rejects(new DebugAgent().run(f), { message: "429 rate limited" });
      }, { LEANCTX_PATH: path.join(dir, "missing-bin") });
    });
  });
});
