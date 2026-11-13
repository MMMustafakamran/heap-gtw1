# backend

AG2 agents for the AG2 React harness. Each doc page's Python snippet sits verbatim in its own module
(`<page>.py`, each with its own `app = FastAPI()`); a HARNESS aggregator per group (`group_*.py`) mounts
those apps under a prefix so a few ports serve every page. Ports: 8063 core (`main.py`), 8064-8069 page groups.
Key: `OPENAI_API_KEY` in `backend/.env` (gitignored), loaded by `uv run --env-file .env`.
