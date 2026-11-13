// Doc: https://docs.copilotkit.ai/ag2/generative-ui/mcp-apps, app/api/copilotkit/[[...slug]]/route.ts, verbatim unless marked HARNESS.
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { BuiltInAgent } from "@copilotkit/runtime/v2";

// 1. Create your agent
const agent = new BuiltInAgent({
  model: "openai/gpt-6-luna",
  prompt: "You are a helpful assistant.",
});

// 2. Create a service adapter, empty if not relevant

// 3. Create the runtime with mcpApps configured
const runtime = new CopilotRuntime({
  agents: {
    default: agent,
  },
  mcpApps: {
    servers: [
      {
        type: "http",
        url: "http://localhost:8067/mcp", // HARNESS: doc :3108; budget-allocator example server from github.com/modelcontextprotocol/ext-apps on our port 8067 (QA-RULES §4)
        serverId: "my-server", // Recommended: stable identifier
      },
    ],
  },
  runner: new InMemoryAgentRunner(),
});

// 4. Create the API route
const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-mcp-apps", // HARNESS: doc "/api/copilotkit" (the harness has one runtime route per doc page)
});

export const GET = handler;
export const POST = handler;
