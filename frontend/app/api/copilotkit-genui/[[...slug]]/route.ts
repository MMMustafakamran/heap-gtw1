// Doc: generative-ui/components, step 2 "Add the runtime and an agent" (React tab), verbatim.
// HARNESS: served at /api/copilotkit-genui (the doc's app/api/copilotkit/[[...slug]]/route.ts path is the
// harness's shared AG2 runtime); basePath changed to match. Nothing else changed.
import { chat } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import {
  BuiltInAgent,
  convertInputToTanStackAI,
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";

const agent = new BuiltInAgent({
  type: "tanstack",
  factory: ({ input, abortController }) => {
    const { messages, systemPrompts, tools } = convertInputToTanStackAI(input);
    return chat({
      adapter: openaiText("gpt-6-luna"),
      messages,
      systemPrompts: [
        "You are a helpful assistant. When a visual answer helps, render it with generative UI.",
        ...systemPrompts,
      ],
      tools,
      abortController,
    });
  },
});

const runtime = new CopilotRuntime({
  agents: { default: agent },
  runner: new InMemoryAgentRunner(),
});

const handler = createCopilotRuntimeHandler({ runtime, basePath: "/api/copilotkit-genui" }); // HARNESS: basePath (doc: "/api/copilotkit")

export const GET = handler;
export const POST = handler;
