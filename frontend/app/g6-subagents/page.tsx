"use client"; // HARNESS: hooks need a client component in an App Router page.

// --- Doc: https://docs.copilotkit.ai/ag2/multi-agent/subagents, app/page.tsx (verbatim) ---
import { z } from "zod";
import { useRenderTool } from "@copilotkit/react-core/v2";
// ...

const YourMainContent = () => {
  // ...
  useRenderTool({
    name: "task_researcher",
    parameters: z.object({
      objective: z.string(),
      context: z.string().optional(),
    }),
    render: ({ status }) => (
      <p className="text-gray-500 mt-2">
        {status !== "complete" && "Researching..."}
        {status === "complete" && "Research done."}
      </p>
    ),
  });
  // ...
  return <CopilotChat agentId="my_agent" />; // HARNESS: the doc elides the return ("// ...")
};
// --- end ---

// HARNESS: provider (quickstart setup) on the group B runtime ("my_agent" = this page's agent.py), with the
// doc's SubagentPanel (components/agent-panel.tsx) shown beside the chat.
import { CopilotKit, CopilotChat } from "@copilotkit/react-core/v2";
import { SubagentPanel } from "./agent-panel";
export default function SubagentsPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit-b" agent="my_agent">
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ width: 320, padding: 24 }}><h2>Delegations</h2><SubagentPanel /></div>
        <div style={{ flex: 1 }}><YourMainContent /></div>
      </div>
    </CopilotKit>
  );
}
