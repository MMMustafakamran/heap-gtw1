# Doc: https://docs.copilotkit.ai/ag2/auth, "Self-hosted Deployment" -> "Setup Dynamic Agent Configuration",
# verbatim. HARNESS: the self-hosted block uses `validate_your_token` ("the same helper as above") and
# `get_account_data` from the "LangGraph Platform Deployment" blocks; those two definitions are copied in
# verbatim above it (a module must define them before `Agent(... tools=[get_account_data])` runs).
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse

from ag2 import Agent
from ag2 import Inject, tool
from ag2.ag_ui import AGUIStream, RunAgentInput
from ag2.config import OpenAIResponsesConfig


def validate_your_token(token: str) -> dict:
    # Replace this with your own validation logic.
    if token != "valid-token":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {
        "user_id": "user_123",
        "role": "member",
        # The scope `get_account_data` below checks against.
        "allowed_accounts": ["acct_456"],
    }


@tool
def get_account_data(
    account_id: str,
    auth_user: Annotated[dict, Inject("auth_user")],
) -> dict:
    """Return account data for the authenticated user."""
    if not auth_user:
        return {"error": "unauthorized"}
    # Example check: ensure user can access this account
    if account_id not in auth_user.get("allowed_accounts", []):
        return {"error": "forbidden"}
    return {"account_id": account_id, "owner": auth_user["user_id"]}


# ── Self-hosted Deployment block (verbatim) ──
agent = Agent(
    name="assistant",
    prompt="You are a helpful assistant.",
    config=OpenAIResponsesConfig(model="gpt-6-luna"),
    tools=[get_account_data], # [!code highlight]
)

stream = AGUIStream(agent)
app = FastAPI()

@app.post("/chat")
async def run_agent(
    message: RunAgentInput,
    accept: str | None = Header(None),
    authorization: str | None = Header(None),
) -> StreamingResponse:
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = authorization.replace("Bearer ", "")
    user_info = validate_your_token(token)  # the same helper as above

    return StreamingResponse(
        stream.dispatch(message, dependencies={"auth_user": user_info}, accept=accept),
        media_type=accept or "text/event-stream",
    )
