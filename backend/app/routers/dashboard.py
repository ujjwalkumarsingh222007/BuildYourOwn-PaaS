from collections import deque
from datetime import datetime
from typing import Deque, Dict
import psutil
from fastapi import APIRouter
from app.database import get_conn, list_activity

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

_cpu_history: Deque[Dict[str, object]] = deque(maxlen=24)
_mem_history: Deque[Dict[str, object]] = deque(maxlen=24)


def _record_host_sample() -> None:
    now_label = datetime.now().strftime("%H:%M:%S")
    cpu_pct = round(psutil.cpu_percent(interval=None), 1)
    mem_pct = round(psutil.virtual_memory().percent, 1)
    _cpu_history.append({"time": now_label, "value": cpu_pct})
    _mem_history.append({"time": now_label, "value": mem_pct})


@router.get("/stats")
def get_dashboard_stats():
    with get_conn() as conn:
        total_projects = conn.execute("SELECT COUNT(*) FROM projects").fetchone()[0]
        running_apps = conn.execute(
            "SELECT COUNT(*) FROM projects WHERE status = 'running'"
        ).fetchone()[0]
        failed_deployments = conn.execute(
            "SELECT COUNT(*) FROM deployments WHERE status = 'failed'"
        ).fetchone()[0]
        total_deployments = conn.execute("SELECT COUNT(*) FROM deployments").fetchone()[0]
    return {
        "totalProjects": total_projects,
        "runningApps": running_apps,
        "failedDeployments": failed_deployments,
        "totalDeployments": total_deployments,
    }


@router.get("/metrics/cpu")
def get_cpu_metrics():
    _record_host_sample()
    return list(_cpu_history)


@router.get("/metrics/memory")
def get_memory_metrics():
    if not _mem_history:
        _record_host_sample()
    return list(_mem_history)


@router.get("/activity")
def get_recent_activity():
    return list_activity(limit=20)
