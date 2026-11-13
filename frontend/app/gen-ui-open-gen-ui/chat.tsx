"use client";
// HARNESS: `./chat` (Chat) is imported by the Code tab's page.tsx but never shown. Minimal stand-in: the prebuilt chat on the page's agent.
import { CopilotChat } from "@copilotkit/react-core/v2";

export function Chat() {
  return <CopilotChat agentId="open-gen-ui" className="h-full rounded-2xl" />;
}
