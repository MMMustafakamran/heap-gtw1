"use client"; // HARNESS: hooks need a client component in an App Router page.

// --- Doc: https://docs.copilotkit.ai/ag2/shared-state/write, ui/app/page.tsx (verbatim) ---
import { useEffect } from "react";
import { useAgent } from "@copilotkit/react-core/v2"; // [!code highlight]

// Define the agent state type, should match the actual state of your agent
type AgentState = {
  language: "english" | "spanish";
}

// Example usage in a pseudo React component
function YourMainContent() {
  const { agent, isReady } = useAgent({
    agentId: "my_agent", // MUST match the agent name in CopilotRuntime
  });
  const state = (agent.state ?? {}) as Partial<AgentState>;

  useEffect(() => {
    if (!isReady || state.language !== undefined) return;
    agent.setState({ ...(agent.state ?? {}), language: "english" });
  }, [agent, isReady, state.language]);

  // default to english until the UI or the agent sets it
  const language = state.language ?? "english";

  const toggleLanguage = () => {
    agent.setState({ ...(agent.state ?? {}), language: state.language === "english" ? "spanish" : "english" }); // [!code highlight]
  };

  // ...

  return (
    // style excluded for brevity
    <div>
      <h1>Your main content</h1>
      {/* [!code highlight:2] */}
      <p>Language: {language}</p>
      <button onClick={toggleLanguage}>Toggle Language</button>
    </div>
  );
}
// --- end ---

// HARNESS: provider + chat (quickstart setup); "my_agent" is this page's agent.py on the group B runtime.
import { CopilotKit, CopilotChat } from "@copilotkit/react-core/v2";
export default function SharedStateWritePage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit-b" agent="my_agent">
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ flex: 1, padding: 24 }}><YourMainContent /></div>
        <div style={{ flex: 1 }}><CopilotChat agentId="my_agent" /></div>
      </div>
    </CopilotKit>
  );
}
