# Quickstart "Connect your own AG2 agent" (https://docs.copilotkit.ai/ag2/quickstart), run_ag_ui.py, verbatim.
from fastapi import FastAPI, Header
from fastapi.responses import StreamingResponse

from ag2 import Agent
from ag2.ag_ui import AGUIStream, RunAgentInput
from ag2.config import OpenAIResponsesConfig

agent = Agent(
    name="support_bot",
    prompt="You help users with billing questions.",
    config=OpenAIResponsesConfig(model="gpt-6-luna"),
)

stream = AGUIStream(agent)
app = FastAPI()

@app.post("/chat")
async def run_agent(
    message: RunAgentInput,
    accept: str | None = Header(None),
) -> StreamingResponse:
    return StreamingResponse(
        stream.dispatch(message, accept=accept),
        media_type=accept or "text/event-stream",
    )
