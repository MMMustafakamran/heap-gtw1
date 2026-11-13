# State Rendering (https://docs.copilotkit.ai/ag2/generative-ui/state-rendering), agent.py, verbatim.
from typing import Annotated

from ag_ui.core import StateSnapshotEvent
from fastapi import FastAPI, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ag2 import Agent, Context, tool
from ag2.ag_ui import AGUIEvent, AGUIStream, RunAgentInput
from ag2.config import OpenAIResponsesConfig

class Search(BaseModel):
    query: str
    done: bool

class AgentState(BaseModel):
    searches: list[Search] = Field(default_factory=list)

def read_state(context: Context) -> AgentState:
    return AgentState.model_validate({"searches": context.variables.get("searches", [])})

def write_state(context: Context, state: AgentState) -> None:
    context.variables["searches"] = state.model_dump()["searches"]

@tool
def add_search(
    new_query: Annotated[str, Field(description="The query to add to state")],
    context: Context,
) -> str:
    """Add a search to the state."""
    state = read_state(context)
    state.searches.append(Search(query=new_query, done=False))
    write_state(context, state)
    return f"Queued search: {new_query}"

@tool
async def run_searches(context: Context) -> str:
    """Run the queued searches and mark them done."""
    state = read_state(context)
    for search in state.searches:
        search.done = True
        write_state(context, state)
        # Stream an intermediate snapshot so the UI updates per search
        await context.send(
            AGUIEvent(StateSnapshotEvent(snapshot=dict(context.variables)))
        )
    return "All searches done."

agent = Agent(
    name="assistant",
    prompt=(
        "You are a helpful assistant for storing searches. "
        "Use `add_search` once per query, then call `run_searches`."
    ),
    config=OpenAIResponsesConfig(model="gpt-6-luna"),
    tools=[add_search, run_searches],
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
