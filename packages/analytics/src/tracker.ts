export interface UsageEntry {
  agentName: string;
  filePath: string;
  originalTokens: number;
  compressedTokens: number;
  savedTokens: number;
  timestamp: Date;
}

export interface UsageReport {
  totalOriginalTokens: number;
  totalCompressedTokens: number;
  totalSavedTokens: number;
  savingsPercent: number;
  entries: UsageEntry[];
  // Estimated cost savings at $0.01 per 1K tokens (gpt-4o-mini rate)
  estimatedCostSavedUSD: number;
}

export class TokenTracker {
  private entries: UsageEntry[] = [];

  logUsage(
    agentName: string,
    filePath: string,
    originalTokens: number,
    compressedTokens: number
  ): void {
    this.entries.push({
      agentName,
      filePath,
      originalTokens,
      compressedTokens,
      savedTokens: originalTokens - compressedTokens,
      timestamp: new Date(),
    });
  }

  report(): UsageReport {
    const totalOriginalTokens = this.entries.reduce(
      (sum, e) => sum + e.originalTokens,
      0
    );
    const totalCompressedTokens = this.entries.reduce(
      (sum, e) => sum + e.compressedTokens,
      0
    );
    const totalSavedTokens = totalOriginalTokens - totalCompressedTokens;
    const savingsPercent =
      totalOriginalTokens > 0
        ? Math.round((totalSavedTokens / totalOriginalTokens) * 100)
        : 0;
    const estimatedCostSavedUSD = (totalSavedTokens / 1000) * 0.01;

    return {
      totalOriginalTokens,
      totalCompressedTokens,
      totalSavedTokens,
      savingsPercent,
      entries: [...this.entries],
      estimatedCostSavedUSD,
    };
  }

  reset(): void {
    this.entries = [];
  }
}

// Singleton for CLI / API usage within a single process
export const globalTracker = new TokenTracker();
