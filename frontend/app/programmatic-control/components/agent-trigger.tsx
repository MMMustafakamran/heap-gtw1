// --- Doc: https://docs.copilotkit.ai/ag2/programmatic-control ("Running the Agent Programmatically", page.tsx, verbatim) ---
import { useAgent } from "@copilotkit/react-core/v2";
import { useCopilotKit } from "@copilotkit/react-core/v2";
import { randomUUID } from "@copilotkit/shared";

export function AgentTrigger() {
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();

  const handleRun = async () => {
    // Add a user message to the agent's conversation
    agent.addMessage({
      id: randomUUID(),
      role: "user",
      content: "Summarize the latest sales data",
    });

    // Run the agent — handles tool execution, follow-ups, and streaming
    await copilotkit.runAgent({ agent });
  };

  return <button onClick={handleRun}>Run Agent</button>;
}
