from fastapi import APIRouter

from app.core.config import settings


router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict[str, str | bool]:
    return {"status": "ok", "service": "body-map-health-advisor", "ai_configured": settings.ai_configured}
