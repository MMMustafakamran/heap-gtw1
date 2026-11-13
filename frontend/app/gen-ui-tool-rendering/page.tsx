"use client"; // HARNESS: hooks need a client component in an App Router page.

// --- Doc: https://docs.copilotkit.ai/ag2/generative-ui/tool-rendering, app/page.tsx (verbatim) ---
import { z } from "zod"; // [!code highlight]
import { useRenderTool } from "@copilotkit/react-core/v2"; // [!code highlight]
// ...

const YourMainContent = () => {
  // ...
  // [!code highlight:13]
  useRenderTool({
    name: "get_weather",
    parameters: z.object({ location: z.string() }),
    render: ({status, parameters}) => {
      return (
        <p className="text-gray-500 mt-2">
          {status !== "complete" && "Calling weather API..."}
          {status === "complete" && `Called the weather API for ${parameters.location}.`}
        </p>
      );
    },
  });
  // ...
  return <CopilotChat agentId="my_agent" />; // HARNESS: the doc elides the return ("// ..."); a chat to talk to the agent
}
// --- end ---

// HARNESS: provider (quickstart setup) pointed at the group B runtime, where "my_agent" is this page's agent.py.
import { CopilotKit, CopilotChat } from "@copilotkit/react-core/v2";
export default function ToolRenderingPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit-b" agent="my_agent">
      <div style={{ height: "100vh" }}><YourMainContent /></div>
    </CopilotKit>
  );
}
