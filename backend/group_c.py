# HARNESS: group C aggregator on 8068. Each doc snippet stays verbatim in its own module (own
# `app = FastAPI()` with `/chat`); mounted under a prefix: http://localhost:8068/<prefix>/chat
# (HARNESS: the docs say localhost:8000/chat).
from fastapi import FastAPI

import auth_page

app = FastAPI()
app.mount("/auth", auth_page.app)  # auth: Self-hosted Deployment snippet

@app.get("/health")
def health():
    return {"ok": True}
