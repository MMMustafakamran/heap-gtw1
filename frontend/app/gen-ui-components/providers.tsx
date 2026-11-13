"use client";
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";
import "@copilotkit/react-core/v2/styles.css";

// HARNESS: runtimeUrl -> /api/copilotkit-genui, the doc step 2 runtime (app/api/copilotkit-genui); doc: "/api/copilotkit"
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit-genui" generativeUI={{ ui: standardUI }}>
      {children}
    </CopilotKitProvider>
  );
}
