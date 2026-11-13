"use client"; // HARNESS: App Router client page; not on the doc.

// --- Doc: https://docs.copilotkit.ai/ag2/prebuilt-components ("CopilotChat", page.tsx, verbatim) ---
import { CopilotChat } from "@copilotkit/react-core/v2";
export function YourComponent() {
  return (
    <CopilotChat
      labels={{
        welcomeMessageText: "Hi! How can I assist you today?",
      }}
    />
  );
}
// --- doc ends ---

// HARNESS: the doc's component has no page around it; give the inline chat a height.
export default function PrebuiltComponentsPage() {
  return (
    <div style={{ height: "100vh" }}>
      <YourComponent />
    </div>
  );
}
