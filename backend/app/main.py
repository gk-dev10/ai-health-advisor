from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.routers import assessment, health


app = FastAPI(
    title="Body Map AI Health Advisor API",
    description="Cautious, educational health guidance based on user-reported symptoms.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(assessment.router, prefix="/api/v1")
register_exception_handlers(app)
