from fastapi import APIRouter
from app.services.builder_service import get_runtime_capabilities
from app.services.k8s_service import k8s_service

router = APIRouter(prefix="/infrastructure", tags=["infrastructure"])


@router.get("/runtime")
def get_host_runtime():
    return get_runtime_capabilities()


@router.get("/health")
def get_cluster_health():
    return k8s_service.get_cluster_health()


@router.get("/nodes")
def get_nodes():
    return k8s_service.list_nodes()


@router.get("/pods")
def get_pods():
    return k8s_service.list_pods()


@router.get("/services")
def get_services():
    return k8s_service.list_services()


@router.get("/namespaces")
def get_namespaces():
    return k8s_service.list_namespaces()
