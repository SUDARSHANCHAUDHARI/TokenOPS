import { BaseAgent } from "./base.agent";

export class DebugAgent extends BaseAgent {
  get name(): string {
    return "debug";
  }

  get systemPrompt(): string {
    return `You are a senior software engineer specializing in debugging.
Analyze code and identify:
1. Bugs and logic errors
2. Potential runtime exceptions
3. Edge cases not handled
4. Security vulnerabilities
5. Performance problems

Format your response as:
## Issues Found
[numbered list of issues, each with severity: CRITICAL / HIGH / MEDIUM / LOW]

## Fixes
[concrete code fixes for each issue]`;
  }

  get userPromptPrefix(): string {
    return "Analyze this code for bugs, errors, and issues:";
  }
}
