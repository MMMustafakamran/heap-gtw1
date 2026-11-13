"use client"; // HARNESS: hooks need a client component in an App Router page.

// --- Doc: https://docs.copilotkit.ai/ag2/shared-state/read, ui/app/page.tsx (verbatim) ---
import { useEffect } from "react";
import { useAgent } from "@copilotkit/react-core/v2"; // [!code highlight]

// Define the agent state type, should match the actual state of your agent
type AgentState = {
  language: "english" | "spanish";
}

function YourMainContent() {
  // [!code highlight:4]
  const { agent, isReady } = useAgent({
    agentId: "my_agent", // MUST match the agent name in CopilotRuntime
  });
  const state = (agent.state ?? {}) as Partial<AgentState>;

  useEffect(() => {
    if (!isReady || state.language !== undefined) return;
    agent.setState({ ...(agent.state ?? {}), language: "english" });
  }, [agent, isReady, state.language]);

  const language = state.language ?? "english";

  // ...

  return (
    // style excluded for brevity
    <div>
      <h1>Your main content</h1>
      {/* [!code highlight:1] */}
      <p>Language: {language}</p>
    </div>
  );
}
// --- end ---

// HARNESS: provider + chat (quickstart setup); "my_agent" is this page's agent.py on the group B runtime.
import { CopilotKit, CopilotChat } from "@copilotkit/react-core/v2";
export default function SharedStateReadPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit-b" agent="my_agent">
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ flex: 1, padding: 24 }}><YourMainContent /></div>
        <div style={{ flex: 1 }}><CopilotChat agentId="my_agent" /></div>
      </div>
    </CopilotKit>
  );
}
