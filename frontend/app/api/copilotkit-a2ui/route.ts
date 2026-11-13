// Doc: https://docs.copilotkit.ai/ag2/generative-ui/a2ui, "Connect it to CopilotKit" (app/api/copilotkit/route.ts), verbatim
// except: HARNESS served at /api/copilotkit-a2ui (the harness has one route per doc page) and the AG2 server on 8066.
import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

const runtime = new CopilotRuntime({
  agents: {
    ui_agent: new HttpAgent({ url: "http://localhost:8066/a2ui/" }), // HARNESS: doc http://localhost:8000/ (QA-RULES §4); server.py mounted at /a2ui by backend/group_b.py
  },
  a2ui: {},
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-a2ui", // HARNESS: doc "/api/copilotkit"
  mode: "single-route",
});

export { handler as POST };
