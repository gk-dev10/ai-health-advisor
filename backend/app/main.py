from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.routers import assessment, health, intakes


app = FastAPI(
    title="Body Map AI Health Advisor API",
    description=(
        "Cautious health education and synthetic clinic intake routing. "
        "Routing supports administrative review and is not a diagnosis."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(assessment.router, prefix="/api/v1")
app.include_router(intakes.router, prefix="/api/v1")
register_exception_handlers(app)
