import "dotenv/config";
import * as path from "path";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { DebugAgent, TestAgent, ReviewAgent } from "@tokenops/agents";
import { globalTracker } from "@tokenops/analytics";

const app = Fastify({ logger: true });

app.register(cors, { origin: true });

const agents = {
  debug: new DebugAgent(),
  test: new TestAgent(),
  review: new ReviewAgent(),
} as const;

type AgentName = keyof typeof agents;

// /analyze may only read files under this root (no auth on this API)
const analyzeRoot = path.resolve(process.env.ANALYZE_ROOT ?? process.cwd());

// POST /analyze
// Body: { agent: "debug" | "test" | "review", file: string }
app.post<{
  Body: { agent: AgentName; file: string };
}>("/analyze", async (request, reply) => {
  const { agent: agentName, file } = request.body;

  if (!agentName || !agents[agentName]) {
    return reply.status(400).send({
      error: `Invalid agent. Valid agents: ${Object.keys(agents).join(", ")}`,
    });
  }

  if (!file) {
    return reply.status(400).send({ error: "file path is required" });
  }

  const resolved = path.resolve(analyzeRoot, file);
  if (!resolved.startsWith(analyzeRoot + path.sep)) {
    return reply.status(403).send({ error: `Path outside allowed root ${analyzeRoot}. Set ANALYZE_ROOT to change it.` });
  }

  const result = await agents[agentName].run(resolved);
  return result;
});

// GET /analytics
// Returns session-level token usage report
app.get("/analytics", async () => {
  return globalTracker.report();
});

// GET /health
app.get("/health", async () => ({ status: "ok", service: "tokenops-api" }));

const port = Number(process.env.API_PORT ?? 3001);
const host = process.env.HOST ?? "127.0.0.1";

app.listen({ port, host }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
