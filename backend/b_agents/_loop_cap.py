# HARNESS: `._loop_cap` is imported by the Code-tab agents (a2ui_dynamic.py, a2ui_fixed.py, open_gen_ui_agent.py)
# but never shown on the doc pages. Minimal stand-in: a pass-through middleware (no loop cap).
from ag2.middleware import BaseMiddleware


def loop_cap(max_turns: int):
    return BaseMiddleware
