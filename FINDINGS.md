# Findings — AG2-React
Open doc defects only, for https://docs.copilotkit.ai/ag2 (React). Numbers are stable IDs (code cites `FINDINGS.md #N`); gaps are removed findings. Agents run on OpenAI with the doc's own model ids.
Stack: harness frontend `@copilotkit/react-core`/`runtime` 1.88.0 (npm latest, CI 2026-11-16) (latest), `@ag-ui/client` 1.0.4, `next` 16.4.6, `react` 19.3.0, `recharts` 3.10.1 (HARNESS); backend `ag2[a2ui,ag-ui,openai]` 1.3.1, `ag-ui-protocol` 1.0.0, `fastapi` 0.162.5, `uvicorn` 0.54.0. Quickstart sample (ag2ai/ag2-samples lockfiles): `ag2` 1.1.2, `@copilotkit/react-core`/`runtime` 1.76.0, pnpm 11.23.0. Node 26.7.0, npm 12.0.2, Python 3.13, uv 0.12.5, Windows 11 Pro. Docs: https://docs.copilotkit.ai/ag2 (snapshot 2026-11-13)

## Dev blockers (seen with `npm run dev` and normal use of the page)

### [Authentication](https://docs.copilotkit.ai/ag2/auth)
**#1 The token never reaches the AG2 backend: every run fails with 401 and the chat stays empty.**
- **Doc:** `properties={{ authorization: userToken, // forwarded to AG2 /chat }}` and "The `authorization` property is forwarded to your AG2 `/chat` endpoint as a request header."
- **Error:** `[CopilotKit] Agent error: HTTP 401: {"detail":"Unauthorized"}`; no reply; backend log 12 x `POST /auth/chat 401`, 0 x 200 over 3+ runs.
- **Confirmed by harness:** the same `/chat` called directly with `authorization: Bearer valid-token` answers, so only the documented properties-to-header forwarding is missing.

### [Programmatic Control](https://docs.copilotkit.ai/ag2/programmatic-control)
**#2 "Hydration failed" error on load (already reported by the team); the run itself works.**

### [Headless Threads](https://docs.copilotkit.ai/ag2/headless-threads)
**#3 The thread list stays empty: the two snippets use different agents.**
- **Doc:** `useThreads({ agentId: "my-agent" })` and `<CopilotChat threadId={activeThreadId} />` (no agentId); `ThreadSidebar` never calls `onSelectThread`.
- **Result:** the chat replies but no thread row ever appears, also after reload (3 runs); `GET /api/copilotkit/threads?agentId=my-agent` returns 200 and no threads; the chat ran on `default`.
- **Confirmed by harness:** `my-agent` is registered (HARNESS), so not a registration error.

### [Components and surfaces](https://docs.copilotkit.ai/ag2/generative-ui/components)
**#4 The step 2 runtime never answers (already reported by the team).**
- **Error:** console `chat() needs a threadId. Pass a non-empty string, for example the id of the conversation.`; no reply.

### [Surfaces](https://docs.copilotkit.ai/ag2/generative-ui/components/surfaces)
**#5 Nothing renders in the featured row (already reported by the team).** `./catalog`, `Product`, `ProductRow` and the product data are never shown; agent says it can't access the catalog (2 runs).

### [Dynamic Schema A2UI](https://docs.copilotkit.ai/ag2/generative-ui/a2ui/dynamic-schema)
**#6 No dashboard renders: the A2UI surface fails, and the Code tab imports files no tab shows.**
- **Doc:** `import { Chat } from "./chat";`, `../_components/badge`, `../_components/button`, `from ._loop_cap import loop_cap`; LangGraph prose and `from ag_ui_langgraph import get_a2ui_tools` on the AG2 page.
- **Error:** `A2UI render error: Cannot read properties of undefined (reading 'map')` (2/2 probes; `generate_a2ui` is called).
- **Confirmed by harness:** with the 4 missing files stubbed (HARNESS) the surface still fails.

### [Fixed Schema A2UI](https://docs.copilotkit.ai/ag2/generative-ui/a2ui/fixed-schema)
**#7 The flight card renders with airports, airline and price empty (already reported by the team).** Backend steps render as skipped snippets; Code-tab imports `./chat`, `../_components/*`, `._loop_cap` never shown. Console on 2026-11-16 (CopilotKit 1.88.0): the agent calls `display_flight`, "no renderer is registered", so that message renders nothing.

### [Writing agent state](https://docs.copilotkit.ai/ag2/shared-state/write)
**#8 The agent never uses the state the UI writes.**
- **Doc:** `agent.setState({ ...(agent.state ?? {}), language: ... })` and "You'll see the language change to match the agent's state."
- **Result:** UI shows "Language: spanish", agent answers "I should answer in English." (3/3); on 2 runs the label flips back.

## Minor notes
- #9 Quickstart: the ag2-samples backend and UI hardcode ports 8000 / 3000 with no override.
- #10 Headless UI: `@copilotkit/shared` has no install step; CustomChat mount point not shown; `useAgent()` with no id needs agent `default`.
- #11 Programmatic Control: `layout.tsx` / `weather-tool.tsx` lack `"use client"` (route 500 "Attempted to call defineToolCallRenderer() from the server"); no way to start a run on the dashboard.
- #12 CopilotChat: `useAgenticChatSuggestions` never defined.
- #13 Markdown Rendering: no default export; no styles for `.my-link` / `.my-heading`.
- #14 HITL Overview: Code-tab agent imports unshown `tools`, `._header_forwarding`, `._loop_cap`, `._request_context`.
- #15 Components as Tools: `SYSTEM_PROMPT` used before defined; no `/chat` endpoint; `BarChart` / `barChartPropsSchema` never shown.
- #16 Open Generative UI: `./chat`, `./design-skill`, `._loop_cap` never shown.
- #17 MCP Apps: TypeScript `BuiltInAgent`, no AG2 agent; MCP server on `localhost:3108` left to the reader.
- #18 State and actions: `Cart` / cart store never defined; `z`, `createGenerativeUI` not imported.
- #19 Adopt from A2UI: Airport and Arrow renderers never shown.
- #20 WebMCP: `searchOrders()` never defined (`ReferenceError`).
- #21 Authentication: `userToken` never defined; self-hosted block reuses `validate_your_token` / `get_account_data` without repeating them.

## Build-only
- #22 `msg.content` not a ReactNode (Headless UI, Programmatic Control); `toolMessage` type mismatch; `defineToolCallRenderer` overload; governed-actions `useInterrupt` render type and `z.record` arity.
