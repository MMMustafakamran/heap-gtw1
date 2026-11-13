// --- Doc: https://docs.copilotkit.ai/ag2/programmatic-control ("Rendering Tool Calls", components/message-list.tsx, verbatim) ---
import { useAgent, useRenderToolCall } from "@copilotkit/react-core/v2";

export function MessageList() {
  const { agent } = useAgent();
  const renderToolCall = useRenderToolCall();

  return (
    <div className="messages">
      {agent.messages.map((message) => (
        <div key={message.id}>
          {/* Display message content */}
          {message.content && <p>{message.content}</p>}

          {/* Render tool calls if present */}
          {message.role === "assistant" &&
            message.toolCalls?.map((toolCall) => {
              const toolMessage = agent.messages.find(
                (m) => m.role === "tool" && m.toolCallId === toolCall.id,
              );
              return (
                <div key={toolCall.id}>
                  {renderToolCall({ toolCall, toolMessage })}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
