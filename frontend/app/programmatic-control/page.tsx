"use client";

// --- Doc: https://docs.copilotkit.ai/ag2/programmatic-control ("Building a Complete Dashboard", page.tsx, verbatim) ---
import { useAgent } from "@copilotkit/react-core/v2";

export function AgentDashboard() { // HARNESS: doc has `export default function AgentDashboard`; the default export is the harness page below
  const { agent } = useAgent();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Status */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Agent Status</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                agent.isRunning ? "bg-yellow-500 animate-pulse" : "bg-green-500"
              }`}
            />
            <span>{agent.isRunning ? "Running" : "Idle"}</span>
          </div>
          <div>Thread: {agent.threadId}</div>
          <div>Messages: {agent.messages.length}</div>
        </div>
      </div>

      {/* State */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Agent State</h2>
        <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(agent.state, null, 2)}
        </pre>
      </div>

      {/* Messages */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Conversation</h2>
        <div className="space-y-3">
          {agent.messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.role === "user" ? "bg-blue-50 ml-8" : "bg-gray-50 mr-8"
              }`}
            >
              <div className="font-semibold text-sm mb-1">
                {msg.role === "user" ? "You" : "Agent"}
              </div>
              <div>{msg.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// --- doc ends ---

// HARNESS: the dashboard has no way to start a run; mount the page's own AgentTrigger ("Running the Agent
// Programmatically") above it so the run can be triggered, as the page describes.
import { AgentTrigger } from "./components/agent-trigger";

export default function ProgrammaticControlPage() {
  return (
    <div>
      <div className="p-8 max-w-4xl mx-auto"><AgentTrigger /></div>
      <AgentDashboard />
    </div>
  );
}
