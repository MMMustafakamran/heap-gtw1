# Components as Tools (https://docs.copilotkit.ai/ag2/generative-ui/tool-based), src/agents/chart_agent.py.
# The page shows this file in two steps: step 1 the Agent (uses SYSTEM_PROMPT), step 2 SYSTEM_PROMPT.
# HARNESS: step 2's block is placed first, otherwise `SYSTEM_PROMPT` is a NameError at import (page order).
SYSTEM_PROMPT = (
    "You are a data visualization assistant. "
    "When the user asks for a chart, call `render_bar_chart` with a "
    "concise title and a `data` array of `{label, value}` items. "
    "Keep chat responses brief and let the chart do the talking."
)

# --- step 1, verbatim ---
from ag2 import Agent
from ag2.ag_ui import AGUIStream
from ag2.config import OpenAIResponsesConfig

chart_agent = Agent(
    name="chart_agent",
    prompt=SYSTEM_PROMPT,
    config=OpenAIResponsesConfig(model="gpt-6-luna"),
    tools=[],
)

chart_stream = AGUIStream(chart_agent)
# --- end of doc code ---

# HARNESS: the page never serves `chart_stream`. Same /chat endpoint as every other AG2 page (e.g. Tool Rendering).
from fastapi import FastAPI, Header
from fastapi.responses import StreamingResponse
from ag2.ag_ui import RunAgentInput

app = FastAPI()

@app.post("/chat")
async def run_agent(
    message: RunAgentInput,
    accept: str | None = Header(None),
) -> StreamingResponse:
    return StreamingResponse(
        chart_stream.dispatch(message, accept=accept),
        media_type=accept or "text/event-stream",
    )
