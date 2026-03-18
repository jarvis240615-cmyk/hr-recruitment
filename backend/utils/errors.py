from fastapi import Request
from fastapi.responses import JSONResponse
from datetime import datetime, timezone


class APIError(Exception):
    def __init__(self, status_code: int, error: str, message: str, details: dict = None):
        self.status_code = status_code
        self.error = error
        self.message = message
        self.details = details or {}


async def api_error_handler(request: Request, exc: APIError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error,
            "message": exc.message,
            "details": exc.details,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "path": str(request.url.path),
        },
    )
