"use client"; // HARNESS: hooks need a client component in an App Router page.

// --- Doc: https://docs.copilotkit.ai/ag2/generative-ui/state-rendering, app/page.tsx (verbatim) ---
import { useAgent } from "@copilotkit/react-core/v2"; // [!code highlight]
// ...

// Define the state of the agent, should match the state streamed by your AG2 backend.
type AgentState = {
  searches: {
    query: string;
    done: boolean;
  }[];
};

function YourMainContent() {
  // ...

  // [!code highlight:4]
  const { agent } = useAgent({
    agentId: "my_agent", // MUST match the agent name in CopilotRuntime
  })
  const state = (agent.state ?? {}) as Partial<AgentState>;

  // ...

  return (
    <div>
      {/* ... */}
      <div className="flex flex-col gap-2 mt-4">
        {/* [!code highlight:5] */}
        {state.searches?.map((search, index) => (
          <div key={index} className="flex flex-row">
            {search.done ? "✅" : "❌"} {search.query}
          </div>
        ))}
      </div>
    </div>
  )
}
// --- end ---

// HARNESS: provider + chat (quickstart setup); "my_agent" is this page's agent.py on the group B runtime.
import { CopilotKit, CopilotChat } from "@copilotkit/react-core/v2";
export default function StateRenderingPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit-b" agent="my_agent">
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ flex: 1, padding: 24 }}><YourMainContent /></div>
        <div style={{ flex: 1 }}><CopilotChat agentId="my_agent" /></div>
      </div>
    </CopilotKit>
  );
}
