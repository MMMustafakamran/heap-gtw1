#!/usr/bin/env bash
# HARNESS: starts every AG2-React server on its harness port (QA-RULES §4: never 3000/8000).
#   8062 quickstart sample backend (quickstart/, the doc's ag2-samples clone; `uv run python -m backend`)
#   3061 quickstart sample UI (quickstart/ui, `pnpm dev`; the recorder starts it itself for the quickstart clip)
#   8063 core AG2 agents (backend/main.py: the doc snippets mounted under a prefix)
#   8064-8069 page-group agents (see the PAGE AGENTS block)
#   3060 Next.js harness frontend (runtime at /api/copilotkit)
# The docs say `export OPENAI_API_KEY=...`; the harness keeps it in a gitignored .env and loads it via --env-file.
cd "$(dirname "$0")"
mkdir -p logs
(cd quickstart && uv run --env-file .env python -m backend > ../logs/quickstart-8062.log 2>&1) &
(cd backend && uv run --env-file .env uvicorn main:app --port 8063 > ../logs/backend-8063.log 2>&1) &

# ── PAGE AGENTS: one line per group app (ports 8064-8069)
# ── GROUP A (8064-8065): no own backend; group A pages use the quickstart agent on 8063 (no AG2 agent on those pages)
# ── GROUP B (8066-8067)
# 8066: group B doc agents (backend/group_b.py mounts each page's verbatim module)
(cd backend && uv run --env-file .env uvicorn group_b:app --port 8066 > ../logs/group-b-8066.log 2>&1) &
# 8067: MCP Apps page's MCP server (doc: "An MCP server running", example servers from github.com/modelcontextprotocol/ext-apps;
#       HARNESS: the budget-allocator example on 8067 instead of the doc's localhost:3108)
(PORT=8067 npx -y @modelcontextprotocol/server-budget-allocator > logs/group-b-mcp-8067.log 2>&1) &
# ── GROUP C (8068-8069)
(cd backend && uv run --env-file .env uvicorn group_c:app --port 8068 > ../logs/group-c-8068.log 2>&1) &
# ── END PAGE AGENTS

(cd frontend && npm run dev > ../logs/frontend-3060.log 2>&1) &
wait
