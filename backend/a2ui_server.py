# A2UI (https://docs.copilotkit.ai/ag2/generative-ui/a2ui), server.py, verbatim.
import uvicorn

from ag2 import Agent
from ag2.a2ui import A2UIServer, a2ui_action
from ag2.a2ui.transports import AgUiTransport
from ag2.config import OpenAIResponsesConfig

@a2ui_action(description="Book the selected dinner reservation")
def book_table(time: str, party_size: int) -> str:
    return f"booked a table for {party_size} at {time}"

agent = Agent(
    name="ui_agent",
    prompt=(
        "Answer with an A2UI surface whenever a list, a choice, or a "
        "confirmation would help the user."
    ),
    config=OpenAIResponsesConfig(model="gpt-6-luna"),
)

app = A2UIServer(
    agent,
    transport=AgUiTransport(),  # AG-UI endpoint at POST /
    actions=[book_table],
    protocol_version="v0.9",
)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
