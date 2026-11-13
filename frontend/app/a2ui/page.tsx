"use client"; // HARNESS: client page for the provider.
// Doc: https://docs.copilotkit.ai/ag2/generative-ui/a2ui. The page says the frontend needs no extra code ("The A2UI
// renderer activates automatically"), so this is the quickstart provider + a chat on the doc's `ui_agent`.
// HARNESS: provider pointed at /api/copilotkit-a2ui (the doc's route.ts for this page); the optional theme is left off,
// as the doc says ("Leave the `a2ui` prop off entirely to keep the built-in theme").
import { CopilotKit, CopilotChat } from "@copilotkit/react-core/v2";

export default function A2UIPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit-a2ui" agent="ui_agent">
      <div style={{ height: "100vh" }}>
        <CopilotChat agentId="ui_agent" />
      </div>
    </CopilotKit>
  );
}
