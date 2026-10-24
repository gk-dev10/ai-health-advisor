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
        if request.url.path.endswith("/override"):
            detail = "Provide a valid final category and a nonempty override reason."
        elif request.method == "GET" and request.url.path.endswith("/intakes"):
            detail = "The intake queue limit must be between 1 and 500."
        elif request.url.path.endswith("/intakes"):
            detail = "Check the synthetic ID, appointment preference, urgency selection, and field lengths."
        elif "/intakes/" in request.url.path:
            detail = "Check the intake request fields and try again."
        else:
            detail = "Check that you selected a body region and entered 10 to 2,000 characters."
        return JSONResponse(
            status_code=422,
            content={"detail": detail},
        )

    @app.exception_handler(Exception)
    async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("Unhandled API error (%s)", type(exc).__name__)
        return JSONResponse(
            status_code=500,
            content={"detail": "The server could not complete this request."},
        )
