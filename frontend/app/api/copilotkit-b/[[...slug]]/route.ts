// HARNESS (group B): runtime for the group B pages whose doc code talks to "my_agent" (or to "the agent you
// connected"). The docs say: start the page's AG2 backend on /chat and connect CopilotKit to it, i.e. the
// quickstart runtime with that page's agent behind "my_agent". Same runtime as the quickstart's
// (Intelligence + identifyUser); only the agent URL differs per page (Referer path -> group B backend on 8066).
import {
  CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";

// HARNESS: page route -> its doc agent, mounted by backend/group_b.py on 8066 (docs: localhost:8000/chat).
const PAGE_AGENT: Record<string, string> = {
  "/gen-ui-tool-based": "http://localhost:8066/tool-based/chat",
  "/gen-ui-tool-rendering": "http://localhost:8066/tool-rendering/chat",
  "/gen-ui-state-rendering": "http://localhost:8066/state-rendering/chat",
  "/shared-state-read": "http://localhost:8066/shared-state-read/chat",
  "/shared-state-write": "http://localhost:8066/shared-state-write/chat",
  "/g6-subagents": "http://localhost:8066/subagents/chat",
};

const handlers = new Map<string, ReturnType<typeof createCopilotRuntimeHandler>>();
function handlerFor(request: Request) {
  let page = "/";
  try { page = new URL(request.headers.get("referer") ?? "").pathname.replace(/\/$/, ""); } catch {}
  const url = PAGE_AGENT[page] ?? PAGE_AGENT["/gen-ui-tool-rendering"];
  let h = handlers.get(url);
  if (!h) {
    const runtime = new CopilotRuntime({
      agents: {
        my_agent: new HttpAgent({ url }),
        default: new HttpAgent({ url }),
      },
      intelligence: new CopilotKitIntelligence({
        apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
      }),
      identifyUser: (request) => ({
        id: request.headers.get("x-user-id") ?? "anonymous",
        name: request.headers.get("x-user-name") ?? "Anonymous",
      }),
    });
    h = createCopilotRuntimeHandler({ runtime, basePath: "/api/copilotkit-b" });
    handlers.set(url, h);
  }
  return h;
}
const handler = (request: Request) => handlerFor(request)(request);

export const GET = handler;
export const POST = handler;
