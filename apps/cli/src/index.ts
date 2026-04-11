#!/usr/bin/env node

import "dotenv/config";
import { DebugAgent, TestAgent, ReviewAgent } from "@tokenops/agents";
import { globalTracker } from "@tokenops/analytics";
import type { AgentResult } from "@tokenops/agents";

const USAGE = `
TokenOps — AI cost optimization engine

Usage:
  tokenops debug <file>    Analyze code for bugs and issues
  tokenops test <file>     Generate test cases
  tokenops review <file>   Review code quality
  tokenops analytics       Show token usage report for this session

Examples:
  tokenops debug src/server.ts
  tokenops test packages/core/src/compress.ts
`;

function printResult(result: AgentResult): void {
  console.log("\n" + "─".repeat(60));
  console.log(`Agent:    ${result.agentName}`);
  console.log(`File:     ${result.filePath}`);
  console.log(
    `Tokens:   ${result.compressedTokens.toLocaleString()} used  |  ${result.savedTokens.toLocaleString()} saved  (${result.savingsPercent}% reduction)`
  );
  console.log("─".repeat(60) + "\n");
  console.log(result.analysis);
  console.log("\n" + "─".repeat(60));
}

function printAnalytics(): void {
  const report = globalTracker.report();
  console.log("\n" + "─".repeat(60));
  console.log("TokenOps Analytics");
  console.log("─".repeat(60));
  console.log(`Total tokens used:   ${report.totalCompressedTokens.toLocaleString()}`);
  console.log(`Total tokens saved:  ${report.totalSavedTokens.toLocaleString()} (${report.savingsPercent}%)`);
  console.log(
    `Estimated savings:   $${report.estimatedCostSavedUSD.toFixed(4)} USD`
  );
  if (report.entries.length > 0) {
    console.log("\nRuns:");
    report.entries.forEach((e, i) => {
      console.log(
        `  ${i + 1}. [${e.agentName}] ${e.filePath} — ${e.savedTokens} tokens saved`
      );
    });
  }
  console.log("─".repeat(60) + "\n");
}

async function main(): Promise<void> {
  const [, , command, filePath] = process.argv;

  if (!command || command === "--help" || command === "-h") {
    console.log(USAGE);
    process.exit(0);
  }

  if (command === "analytics") {
    printAnalytics();
    return;
  }

  if (!filePath) {
    console.error(`Error: file path required.\n${USAGE}`);
    process.exit(1);
  }

  const agentMap: Record<string, () => Promise<AgentResult>> = {
    debug: () => new DebugAgent().run(filePath),
    test: () => new TestAgent().run(filePath),
    review: () => new ReviewAgent().run(filePath),
  };

  const agentFn = agentMap[command];
  if (!agentFn) {
    console.error(`Unknown command: ${command}\n${USAGE}`);
    process.exit(1);
  }

  console.log(`Running ${command} agent on ${filePath}...`);
  const result = await agentFn();
  printResult(result);
  printAnalytics();
}

main().catch((err: Error) => {
  console.error("Error:", err.message);
  process.exit(1);
});
