import { BaseAgent } from "./base.agent";

export class TestAgent extends BaseAgent {
  get name(): string {
    return "test";
  }

  get systemPrompt(): string {
    return `You are a senior QA engineer and test architect.
Generate comprehensive test cases for the provided code.

Include:
1. Unit tests for each function/method
2. Edge case tests
3. Error/exception tests
4. Happy path tests

Use the same language as the input code.
Format: produce complete, runnable test code.`;
  }

  get userPromptPrefix(): string {
    return "Generate thorough test cases for this code:";
  }
}
