"use client";
import { CopilotChat } from "@copilotkit/react-core/v2";

export default function Page() {
  return (
    <>

      <CopilotChat agentId="my_agent" />{/* HARNESS: agentId -> the quickstart AG2 agent (backend/run_ag_ui.py on 8063) */}
    </>
  );
}
