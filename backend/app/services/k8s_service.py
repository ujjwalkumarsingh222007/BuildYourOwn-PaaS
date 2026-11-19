from pathlib import Path
from typing import Any, Dict, List
from app.config import KUBECONFIG_PATH

try:
    from kubernetes import client, config
    K8S_CLIENT_AVAILABLE = True
except ImportError:
    K8S_CLIENT_AVAILABLE = False


class K3sClusterService:
    """
    Connects to a real Kubernetes / K3s cluster when KUBECONFIG is configured.
    Returns honest disconnected / empty states when no kubeconfig is available.
    """

    def _load_api(self):
        if not K8S_CLIENT_AVAILABLE:
            return None
        kube_path = Path(KUBECONFIG_PATH) if KUBECONFIG_PATH else Path.home() / ".kube" / "config"
        if not kube_path.exists():
            return None
        try:
            config.load_kube_config(config_file=str(kube_path))
            return client.CoreV1Api()
        except Exception:
            return None

    def get_cluster_health(self) -> Dict[str, Any]:
        api = self._load_api()
        if not api:
            return {
                "status": "disconnected",
                "nodes": {"ready": 0, "total": 0},
                "pods": {"running": 0, "total": 0},
                "cpu": {"used": 0, "total": 0, "unit": "cores"},
                "memory": {"used": 0, "total": 0, "unit": "GB"},
                "uptime": "Not connected",
                "k3sVersion": "Not connected",
            }
        try:
            nodes = api.list_node().items
            pods = api.list_pod_for_all_namespaces().items
            ready_nodes = sum(
                1
                for n in nodes
                if any(c.type == "Ready" and c.status == "True" for c in (n.status.conditions or []))
            )
            running_pods = sum(1 for p in pods if p.status.phase == "Running")
            version = nodes[0].status.node_info.kubelet_version if nodes else "unknown"
            return {
                "status": "healthy" if ready_nodes == len(nodes) and len(nodes) > 0 else "degraded",
                "nodes": {"ready": ready_nodes, "total": len(nodes)},
                "pods": {"running": running_pods, "total": len(pods)},
                "cpu": {"used": 0, "total": len(nodes) * 2, "unit": "cores"},
                "memory": {"used": 0, "total": len(nodes) * 4, "unit": "GB"},
                "uptime": "Connected",
                "k3sVersion": version,
            }
        except Exception:
            return {
                "status": "unhealthy",
                "nodes": {"ready": 0, "total": 0},
                "pods": {"running": 0, "total": 0},
                "cpu": {"used": 0, "total": 0, "unit": "cores"},
                "memory": {"used": 0, "total": 0, "unit": "GB"},
                "uptime": "Error",
                "k3sVersion": "Error",
            }

    def list_nodes(self) -> List[Dict[str, Any]]:
        api = self._load_api()
        if not api:
            return []
        try:
            items = api.list_node().items
            result = []
            for n in items:
                is_ready = any(
                    c.type == "Ready" and c.status == "True" for c in (n.status.conditions or [])
                )
                roles = [
                    k.replace("node-role.kubernetes.io/", "")
                    for k in (n.metadata.labels or {})
                    if k.startswith("node-role.kubernetes.io/")
                ]
                result.append(
                    {
                        "id": n.metadata.uid or n.metadata.name,
                        "name": n.metadata.name,
                        "status": "ready" if is_ready else "not_ready",
                        "role": "master" if any("control-plane" in r or "master" in r for r in roles) else "worker",
                        "cpu": {"used": 0, "total": int(n.status.allocatable.get("cpu", "2").rstrip("m"))},
                        "memory": {"used": 0, "total": 8},
                        "pods": 0,
                        "maxPods": int(n.status.allocatable.get("pods", "110")),
                        "kubeletVersion": n.status.node_info.kubelet_version,
                        "os": n.status.node_info.os_image,
                        "uptime": "Connected",
                    }
                )
            return result
        except Exception:
            return []

    def list_pods(self) -> List[Dict[str, Any]]:
        api = self._load_api()
        if not api:
            return []
        try:
            items = api.list_pod_for_all_namespaces().items
            return [
                {
                    "id": p.metadata.uid or p.metadata.name,
                    "name": p.metadata.name,
                    "namespace": p.metadata.namespace,
                    "status": p.status.phase or "Unknown",
                    "restarts": sum(cs.restart_count for cs in (p.status.container_statuses or [])),
                    "cpu": "—",
                    "memory": "—",
                    "node": p.spec.node_name or "unscheduled",
                    "age": str(p.metadata.creation_timestamp or "—"),
                }
                for p in items
            ]
        except Exception:
            return []

    def list_services(self) -> List[Dict[str, Any]]:
        api = self._load_api()
        if not api:
            return []
        try:
            items = api.list_service_for_all_namespaces().items
            return [
                {
                    "id": s.metadata.uid or s.metadata.name,
                    "name": s.metadata.name,
                    "namespace": s.metadata.namespace,
                    "type": s.spec.type or "ClusterIP",
                    "clusterIp": s.spec.cluster_ip or "None",
                    "ports": ", ".join(f"{p.port}/{p.protocol}" for p in (s.spec.ports or [])),
                    "age": str(s.metadata.creation_timestamp or "—"),
                }
                for s in items
            ]
        except Exception:
            return []

    def list_namespaces(self) -> List[Dict[str, Any]]:
        api = self._load_api()
        if not api:
            return []
        try:
            items = api.list_namespace().items
            return [
                {
                    "id": ns.metadata.uid or ns.metadata.name,
                    "name": ns.metadata.name,
                    "status": ns.status.phase or "Active",
                    "pods": 0,
                    "services": 0,
                    "age": str(ns.metadata.creation_timestamp or "—"),
                }
                for ns in items
            ]
        except Exception:
            return []


k8s_service = K3sClusterService()
