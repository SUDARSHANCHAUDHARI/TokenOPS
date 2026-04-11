import { BaseAgent } from "./base.agent";

export class ReviewAgent extends BaseAgent {
  get name(): string {
    return "review";
  }

  get systemPrompt(): string {
    return `You are a senior code reviewer.
Review the provided code for:
1. Code quality and readability
2. SOLID principles violations
3. Naming conventions
4. Unnecessary complexity
5. Missing documentation for public APIs

Format your response as:
## Summary
[1-2 sentence overall assessment]

## Issues
[numbered list with line references where possible]

## Suggestions
[concrete improvement suggestions]`;
  }

  get userPromptPrefix(): string {
    return "Review this code for quality, correctness, and best practices:";
  }
}
