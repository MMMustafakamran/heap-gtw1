# HARNESS: group B aggregator on 8066 (QA-RULES §4; the docs say localhost:8000). Every doc snippet stays verbatim in
# its own module; this app only mounts them under a prefix. HttpAgent URL = http://localhost:8066/<prefix>/chat
# (Code-tab agents built with `stream.build_asgi()` are served at the prefix root: http://localhost:8066/<prefix>/).
from fastapi import FastAPI

import a2ui_server
import chart_agent
import shared_state_read
import shared_state_write
import state_rendering
import subagents
import tool_rendering
from b_agents import a2ui_dynamic, a2ui_fixed, open_gen_ui_agent

app = FastAPI()
app.mount("/tool-based", chart_agent.app)                     # Components as Tools
app.mount("/tool-rendering", tool_rendering.app)              # Tool Rendering
app.mount("/state-rendering", state_rendering.app)            # State Rendering
app.mount("/shared-state-read", shared_state_read.app)        # Reading agent state
app.mount("/shared-state-write", shared_state_write.app)      # Writing agent state
app.mount("/subagents", subagents.app)                        # Subagents
app.mount("/a2ui", a2ui_server.app)                           # A2UI (A2UIServer, AG-UI endpoint at POST /)
app.mount("/declarative-gen-ui", a2ui_dynamic.a2ui_dynamic_app)  # Dynamic Schema A2UI (Code tab)
app.mount("/a2ui-fixed-schema", a2ui_fixed.a2ui_fixed_app)    # Fixed Schema A2UI (Code tab)
app.mount("/open-gen-ui", open_gen_ui_agent.open_gen_ui_app)  # Open Generative UI (Code tab)


@app.get("/health")
def health():
    return {"ok": True}
