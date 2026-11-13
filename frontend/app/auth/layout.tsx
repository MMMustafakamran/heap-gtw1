"use client";
// Doc: https://docs.copilotkit.ai/ag2/auth, "Frontend Setup", verbatim.
import { CopilotKit } from "@copilotkit/react-core/v2";

// HARNESS: the doc never defines `userToken`; the value its own backend snippet accepts ("valid-token").
const userToken = "valid-token";

export default function Layout({ children: YourApp }: { children: React.ReactNode }) { // HARNESS: route layout; the doc's <YourApp /> is this route's page
  return (
<CopilotKit
  runtimeUrl="/api/copilotkit"
  agent="auth_agent" // HARNESS: the doc's self-hosted AG2 /chat (backend/auth_page.py on 8068), registered in the shared runtime
  useSingleEndpoint={false} // HARNESS: the shared runtime is multi-route, as the quickstart's provider
  properties={{
    authorization: userToken, // forwarded to AG2 /chat
  }}
>
  {YourApp}
</CopilotKit>
  );
}
