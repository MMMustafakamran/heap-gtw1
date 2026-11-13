# AG2-React

Docs QA harness for CopilotKit + AG2, React: https://docs.copilotkit.ai/ag2. One route per doc page, doc code verbatim, one clip per page. The goal is to show doc defects; fixes that hide one are banned.

## Rules

`.qa/` is the vendored copy of the shared tooling and rules (filled by the sync script; never edit it here).

@.qa/instructions/QA-RULES.md
@.qa/instructions/AUTORECORDER.md
@.qa/instructions/VOICE.md
@.qa/instructions/REVIEW.md
@.qa/instructions/REPORT.md

## This repo

- Ports: frontend **3060** (Next.js, runtime at `/api/copilotkit/[[...slug]]` plus page-own runtime routes), quickstart sample **8062** backend / **3061** UI (`quickstart/`, the doc's `ag2ai/ag2-samples` clone, ports HARNESS), AG2 agents **8063** core (`backend/main.py`), **8066-8069** page groups (`backend/group_*.py`). Never 3000 / 8000.
- Every doc Python snippet sits verbatim in its own `backend/<page>.py`; HARNESS aggregators mount them under a prefix.
- Keys: `quickstart/.env` (OPENAI_API_KEY, AUTH_SECRET), `backend/.env` and `frontend/.env.local` (OPENAI_API_KEY), `frontend/.env` (CPK_INTELLIGENCE_API_KEY). Never print or commit them.
- Recorder: `autorecorder/` (probe: `npx tsx ../.qa/tools/probe.mts <id>`; record in CI). Findings per group: `autorecorder/actions/group-{a,b,c}.ts`.
