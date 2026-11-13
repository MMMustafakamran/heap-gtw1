# HARNESS: core aggregator on 8063. Every doc snippet stays verbatim in its own module (each builds its
# own `app = FastAPI()` with a `/chat` route); this app mounts them under a prefix so one port serves them.
# A page's HttpAgent URL is http://localhost:8063/<prefix>/chat (HARNESS: the docs say localhost:8000/chat).
from fastapi import FastAPI

import frontend_tools
import run_ag_ui

app = FastAPI()
app.mount("/quickstart", run_ag_ui.app)          # quickstart "Connect your own AG2 agent"
app.mount("/frontend-tools", frontend_tools.app)  # frontend-tools agent.py

@app.get("/health")
def health():
    return {"ok": True}
