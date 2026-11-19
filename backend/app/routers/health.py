from fastapi import APIRouter
from app.services.aws_service import aws_session_store
from app.services.k8s_service import k8s_service

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "buildyourown-paas-api",
        "aws": aws_session_store.get_status().get("status", "disconnected"),
        "k3s": k8s_service.get_cluster_health().get("status", "disconnected"),
    }
