# Tool Rendering (https://docs.copilotkit.ai/ag2/generative-ui/tool-rendering), agent.py, verbatim.
from typing import Annotated

from fastapi import FastAPI, Header
from fastapi.responses import StreamingResponse
from pydantic import Field

from ag2 import Agent, tool
from ag2.ag_ui import AGUIStream, RunAgentInput
from ag2.config import OpenAIResponsesConfig

@tool
def get_weather(
    location: Annotated[str, Field(description="Fully spelled out location")],
) -> str:
    """Get the weather for a given location. Ensure location is fully spelled out."""
    return f"The weather in {location} is sunny."

agent = Agent(
    name="assistant",
    prompt="You are a helpful assistant.",
    config=OpenAIResponsesConfig(model="gpt-6-luna"),
    tools=[get_weather],
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
