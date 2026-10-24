import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


logger = logging.getLogger("app")


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Avoid echoing symptom text in validation responses.
        return JSONResponse(
            status_code=422,
            content={"detail": "Check that you selected a body region and entered 10 to 2,000 characters."},
        )

    @app.exception_handler(Exception)
    async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("Unhandled API error (%s)", type(exc).__name__)
        return JSONResponse(
            status_code=500,
            content={"detail": "The server could not complete this request."},
        )
