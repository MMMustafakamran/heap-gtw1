"use client";
// HARNESS: the doc shows no page; a plain chat to talk to the authenticated agent.
import { CopilotChat } from "@copilotkit/react-core/v2";

export default function Page() {
  return <div style={{ height: "100vh" }}><CopilotChat /></div>;
}
