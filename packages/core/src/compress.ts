import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execFileAsync = promisify(execFile);

function resolveLeanCtxBinary(): string {
  // 1. Explicit env override
  if (process.env.LEANCTX_PATH) {
    return process.env.LEANCTX_PATH;
  }
  // 2. Local services/context-engine (when running from monorepo root)
  const localBin = path.resolve(
    __dirname,
    "../../../../services/context-engine/leanctx"
  );
  if (fs.existsSync(localBin)) {
    return localBin;
  }
  // 3. Assume leanctx is in PATH
  return "leanctx";
}

export interface CompressResult {
  output: string;
  originalChars: number;
  compressedChars: number;
  savingsPercent: number;
}

export async function compressFile(filePath: string): Promise<CompressResult> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const original = fs.readFileSync(filePath, "utf-8");
  const binary = resolveLeanCtxBinary();

  let output: string;

  try {
    const result = await execFileAsync(binary, ["compress", filePath]);
    output = result.stdout.trim();
  } catch {
    // LeanCTX binary not available — fall back to the raw file content
    // so the rest of the pipeline still works without the binary installed
    console.warn(
      "[tokenops] leanctx binary not found — using raw file content (no compression)"
    );
    output = original;
  }

  const originalChars = original.length;
  const compressedChars = output.length;
  const savingsPercent =
    originalChars > 0
      ? Math.round(((originalChars - compressedChars) / originalChars) * 100)
      : 0;

  return { output, originalChars, compressedChars, savingsPercent };
}

export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters (OpenAI rule of thumb)
  return Math.ceil(text.length / 4);
}
