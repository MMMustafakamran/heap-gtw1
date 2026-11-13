import {
  CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";

// HARNESS: every page agent is registered in this one runtime (below), but the browser opens one
// Intelligence socket per registered agent and with ~20 the thread join times out ("Timed out joining
// channel"). So each request gets a runtime holding only the agents its page uses (see handlerFor below).
const ALL_AGENTS = {
    // HARNESS: AG2 agents run on 8063-8069 (QA-RULES §4; the docs say localhost:8000/chat). Each doc
    // snippet's FastAPI app is mounted under a prefix by a HARNESS aggregator (backend/main.py, group_*.py).
    my_agent: new HttpAgent({ url: "http://localhost:8063/quickstart/chat" }), // quickstart "Connect your own AG2 agent"
    default: new HttpAgent({ url: "http://localhost:8063/quickstart/chat" }), // useAgent() with no id
    frontend_tools: new HttpAgent({ url: "http://localhost:8063/frontend-tools/chat" }), // frontend-tools agent.py (doc: /chat on 8000)
    // ── GROUP A agents (ports 8064-8065) ──
    // HARNESS (A): agent ids the pages use but never register or back with an AG2 agent; all point at the
    // quickstart AG2 agent (what a reader following the docs has running).
    agentic_chat: new HttpAgent({ url: "http://localhost:8063/quickstart/chat" }), // prebuilt-components/chat (agent="agentic_chat")
    "my-agent": new HttpAgent({ url: "http://localhost:8063/quickstart/chat" }), // headless-threads useThreads({ agentId: "my-agent" })
    "hitl-in-chat": new HttpAgent({ url: "http://localhost:8063/quickstart/chat" }), // HITL Overview Code tab (agent.py needs unshown modules)
    // ── END GROUP A ──
    // ── GROUP B agents (ports 8066-8067) ──
    // (none here: group B pages use their doc's own runtime routes, api/copilotkit-b, -a2ui, -declarative-gen-ui,
    //  -a2ui-fixed-schema, -ogui, -mcp-apps)
    // ── END GROUP B ──
    // ── GROUP C agents (ports 8068-8069) ──
    auth_agent: new HttpAgent({ url: "http://localhost:8068/auth/chat" }), // auth: Self-hosted Deployment /chat (backend/auth_page.py)
    // ── END GROUP C ──
};

const makeRuntime = (agents: Record<string, HttpAgent>) => new CopilotRuntime({
  agents,
  intelligence: new CopilotKitIntelligence({
    apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
  }),
  // Threads are per-user. Without this, every visitor shares one history.
  identifyUser: (request) => ({
    id: request.headers.get("x-user-id") ?? "anonymous",
    name: request.headers.get("x-user-name") ?? "Anonymous",
  }),
});

// HARNESS (begin): per-page agent scoping. The page is read from the Referer; its agents are the
// registered ids that appear in its own source folder. Doc behaviour (Intelligence, identifyUser) is unchanged.
import fs from "node:fs";
import path from "node:path";
const APP_DIR = path.join(process.cwd(), "app");
const handlers = new Map<string, ReturnType<typeof createCopilotRuntimeHandler>>();
function agentsFor(pagePath: string): string[] {
  const dir = path.join(APP_DIR, ...pagePath.split("/").filter(Boolean));
  const found = new Set<string>();
  const walk = (d: string) => {
    let entries: fs.Dirent[] = [];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== "api") walk(f); continue; }
      if (!/\.(tsx?|jsx?)$/.test(e.name)) continue;
      const src = fs.readFileSync(f, "utf8");
      for (const id of Object.keys(ALL_AGENTS)) if (src.includes(`"${id}"`) || src.includes(`'${id}'`)) found.add(id);
    }
  };
  if (pagePath && pagePath !== "/") walk(dir);
  // useAgent() / providers without an id resolve "default"; shared files (app/providers.tsx) use my_agent,
  // which the folder walk can't see, so both are always included. Capped near 3 agents (socket timeout above).
  const extra = [...found].filter((id) => id !== "my_agent" && id !== "default").sort().slice(0, 2);
  return ["default", "my_agent", ...extra].sort();
}
function handlerFor(request: Request) {
  let page = "/";
  try { page = new URL(request.headers.get("referer") ?? "").pathname; } catch {}
  const ids = agentsFor(page);
  const key = ids.join(",");
  let h = handlers.get(key);
  if (!h) {
    const agents = Object.fromEntries(ids.map((id) => [id, ALL_AGENTS[id as keyof typeof ALL_AGENTS]]));
    h = createCopilotRuntimeHandler({ runtime: makeRuntime(agents), basePath: "/api/copilotkit" });
    handlers.set(key, h);
  }
  return h;
}
const handler = (request: Request) => handlerFor(request)(request);
// HARNESS (end)

export const GET = handler;
export const POST = handler;
