import uvicorn

from .app import app

uvicorn.run(app, host="0.0.0.0", port=8062)  # HARNESS: doc hardcodes 8000 (QA-RULES §4), no override; moved to 8062
