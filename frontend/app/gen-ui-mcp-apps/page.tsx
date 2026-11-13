"use client";
// Doc: https://docs.copilotkit.ai/ag2/generative-ui/mcp-apps. app/providers.tsx + app/page.tsx, verbatim except:
// HARNESS: the provider's runtimeUrl is /api/copilotkit-mcp-apps (the doc's runtime route for this page; the harness
// has one runtime per doc page), and both files sit in this route instead of the root layout.

// --- app/providers.tsx (verbatim, runtimeUrl HARNESS) ---
import { CopilotKit } from "@copilotkit/react-core/v2";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit-mcp-apps" useSingleEndpoint={false}>
      {children}
    </CopilotKit>
  );
}

// --- app/page.tsx (verbatim) ---
import { CopilotSidebar } from "@copilotkit/react-core/v2";

function Page() {
    return (
        <main>
            <h1>Your App</h1>
            <CopilotSidebar />
        </main>
    );
}

// HARNESS: the doc's layout wraps {children} in <Providers>; here the route does it.
export default function McpAppsRoute() {
  return (
    <Providers>
      <Page />
    </Providers>
  );
}
