import "dotenv/config";
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

  const result = await agents[agentName].run(file);
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

app.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
