"use strict";
const { describe, it, beforeEach, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { TokenTracker, globalTracker } = require("../packages/analytics/dist/index.js");

const FIXED_NOW = Date.parse("2026-01-02T03:04:05.000Z");

describe("TokenTracker", () => {
  let tracker;
  beforeEach(() => {
    mock.timers.enable({ apis: ["Date"], now: FIXED_NOW });
    tracker = new TokenTracker();
  });
  afterEach(() => mock.timers.reset());

  it("empty tracker reports zeros without dividing by zero", () => {
    assert.deepEqual(tracker.report(), {
      totalOriginalTokens: 0,
      totalCompressedTokens: 0,
      totalSavedTokens: 0,
      savingsPercent: 0,
      entries: [],
      estimatedCostSavedUSD: 0,
    });
  });

  it("logUsage records saved = original - compressed and a timestamp", () => {
    tracker.logUsage("debug", "src/a.ts", 1000, 400);
    const [entry] = tracker.report().entries;
    assert.deepEqual(entry, {
      agentName: "debug",
      filePath: "src/a.ts",
      originalTokens: 1000,
      compressedTokens: 400,
      savedTokens: 600,
      timestamp: new Date(FIXED_NOW),
    });
  });

  it("aggregates totals across entries and rounds the percentage", () => {
    tracker.logUsage("debug", "a.ts", 1000, 667); // saved 333
    tracker.logUsage("test", "b.ts", 1000, 1000); // saved 0
    const r = tracker.report();
    assert.equal(r.totalOriginalTokens, 2000);
    assert.equal(r.totalCompressedTokens, 1667);
    assert.equal(r.totalSavedTokens, 333);
    assert.equal(r.savingsPercent, 17); // 16.65 -> 17
    assert.equal(r.entries.length, 2);
  });

  it("estimates cost at $0.01 per 1K saved tokens", () => {
    tracker.logUsage("review", "a.ts", 50_000, 0);
    assert.ok(Math.abs(tracker.report().estimatedCostSavedUSD - 0.5) < 1e-12);
  });

  it("report().entries is a copy: mutating it does not change the tracker", () => {
    tracker.logUsage("debug", "a.ts", 10, 5);
    tracker.report().entries.length = 0;
    assert.equal(tracker.report().entries.length, 1);
  });

  it("reset() clears entries and totals", () => {
    tracker.logUsage("debug", "a.ts", 10, 5);
    tracker.reset();
    const r = tracker.report();
    assert.equal(r.entries.length, 0);
    assert.equal(r.totalOriginalTokens, 0);
  });

  it("trackers are independent of each other and of globalTracker", () => {
    const other = new TokenTracker();
    other.logUsage("debug", "a.ts", 10, 5);
    assert.equal(tracker.report().entries.length, 0);
    assert.notEqual(globalTracker, tracker);
    assert.ok(globalTracker instanceof TokenTracker);
  });
});
