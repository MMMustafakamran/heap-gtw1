# Reading agent state (https://docs.copilotkit.ai/ag2/shared-state/read), agent.py, verbatim.
from typing import Annotated

from fastapi import FastAPI, Header
from fastapi.responses import StreamingResponse
from pydantic import Field

from ag2 import Agent, Context, tool
from ag2.ag_ui import AGUIStream, RunAgentInput
from ag2.config import OpenAIResponsesConfig

@tool
def set_language(
    language: Annotated[str, Field(description="language such as english or spanish")],
    context: Context,
) -> str:
    """Update the language in shared state."""
    context.variables["language"] = language.lower()
    return f"Language set to {language}"

agent = Agent(
    name="assistant",
    prompt=(
        "You are a helpful assistant for tracking language. "
        "Always respond in the current language."
    ),
    config=OpenAIResponsesConfig(model="gpt-6-luna"),
    tools=[set_language],
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
