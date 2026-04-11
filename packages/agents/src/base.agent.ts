import OpenAI from "openai";
import { compressFile, estimateTokens } from "@tokenops/core";
import { globalTracker } from "@tokenops/analytics";

export interface AgentResult {
  agentName: string;
  filePath: string;
  analysis: string;
  originalTokens: number;
  compressedTokens: number;
  savedTokens: number;
  savingsPercent: number;
}

export abstract class BaseAgent {
  protected client: OpenAI;
  protected model: string;

  constructor(model = "gpt-4o-mini") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = model;
  }

  abstract get name(): string;
  abstract get systemPrompt(): string;
  abstract get userPromptPrefix(): string;

  async run(filePath: string): Promise<AgentResult> {
    const { output, originalChars, compressedChars } =
      await compressFile(filePath);

    const originalTokens = estimateTokens("=".repeat(originalChars));
    const compressedTokens = estimateTokens(output);
    const savedTokens = Math.max(0, originalTokens - compressedTokens);
    const savingsPercent =
      originalTokens > 0
        ? Math.round((savedTokens / originalTokens) * 100)
        : 0;

    globalTracker.logUsage(this.name, filePath, originalTokens, compressedTokens);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: this.systemPrompt },
        {
          role: "user",
          content: `${this.userPromptPrefix}\n\n\`\`\`\n${output}\n\`\`\``,
        },
      ],
    });

    const analysis = response.choices[0]?.message?.content ?? "(no response)";

    return {
      agentName: this.name,
      filePath,
      analysis,
      originalTokens,
      compressedTokens,
      savedTokens,
      savingsPercent,
    };
  }
}
