"use client";

import { useState } from "react";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

type AgentName = "debug" | "test" | "review";

interface AnalyzeResult {
  agentName: string;
  filePath: string;
  analysis: string;
  originalTokens: number;
  compressedTokens: number;
  savedTokens: number;
  savingsPercent: number;
}

export default function HomePage() {
  const [filePath, setFilePath] = useState("");
  const [agent, setAgent] = useState<AgentName>("debug");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!filePath.trim()) {
      setError("Please enter a file path.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, file: filePath }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as AnalyzeResult;
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 24px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "48px" }}>
        <div
          style={{
            display: "inline-block",
            background: "var(--accent-dim)",
            color: "var(--accent)",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            marginBottom: "16px",
          }}
        >
          BETA
        </div>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Token<span style={{ color: "var(--accent)" }}>Ops</span>
        </h1>
        <p
          style={{
            marginTop: "12px",
            fontSize: "18px",
            color: "var(--muted)",
            maxWidth: "480px",
          }}
        >
          AI cost optimization and workflow engine. Compress context. Reduce
          tokens. Maximize intelligence.
        </p>
      </div>

      {/* Input panel */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="Absolute file path, e.g. /home/user/project/src/server.ts"
            style={{
              flex: 1,
              minWidth: "240px",
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />

          <select
            value={agent}
            onChange={(e) => setAgent(e.target.value as AgentName)}
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
            }}
          >
            <option value="debug">Debug</option>
            <option value="test">Generate Tests</option>
            <option value="review">Code Review</option>
          </select>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              background: loading ? "var(--accent-dim)" : "var(--accent)",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {error && (
          <p
            style={{ marginTop: "12px", color: "#f87171", fontSize: "14px" }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Results */}
      {result && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          {/* Token savings bar */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            {[
              {
                label: "Tokens Used",
                value: result.compressedTokens.toLocaleString(),
              },
              {
                label: "Tokens Saved",
                value: result.savedTokens.toLocaleString(),
                accent: true,
              },
              {
                label: "Reduction",
                value: `${result.savingsPercent}%`,
                accent: true,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "12px 20px",
                  minWidth: "120px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                    marginBottom: "4px",
                  }}
                >
                  {stat.label.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: stat.accent ? "var(--success)" : "var(--foreground)",
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "13px",
              lineHeight: 1.7,
              color: "var(--foreground)",
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "16px",
              overflow: "auto",
            }}
          >
            {result.analysis}
          </pre>
        </div>
      )}

      {/* Footer */}
      <p
        style={{
          marginTop: "48px",
          color: "var(--muted)",
          fontSize: "13px",
          textAlign: "center",
        }}
      >
        TokenOps — SudarshanTechLabs · Powered by LeanCTX + OpenAI
      </p>
    </main>
  );
}
