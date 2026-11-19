from datetime import datetime, timezone
from typing import Optional
import uuid
from fastapi import APIRouter, HTTPException, Query
from app.database import add_activity, get_conn, row_to_deployment
from app.models import DeploymentResponse

router = APIRouter(prefix="/deployments", tags=["deployments"])


@router.get("", response_model=list[DeploymentResponse])
def list_deployments(projectId: Optional[str] = Query(default=None)):
    with get_conn() as conn:
        if projectId:
            rows = conn.execute(
                "SELECT * FROM deployments WHERE project_id = ? ORDER BY created_at DESC",
                (projectId,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM deployments ORDER BY created_at DESC"
            ).fetchall()
        return [row_to_deployment(r) for r in rows]


@router.get("/{deployment_id}", response_model=DeploymentResponse)
def get_deployment(deployment_id: str):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM deployments WHERE id = ?", (deployment_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Deployment not found")
        return row_to_deployment(row)


@router.get("/{deployment_id}/artifacts")
def get_deployment_artifacts(deployment_id: str):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM deployments WHERE id = ?", (deployment_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Deployment not found")
        dep = row_to_deployment(row)
        return dep.get("artifacts", {})


@router.post("/{deployment_id}/rollback", response_model=DeploymentResponse)
def rollback_deployment(deployment_id: str):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM deployments WHERE id = ?", (deployment_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Deployment not found")
        conn.execute(
            "UPDATE deployments SET status = 'running' WHERE id = ?",
            (deployment_id,),
        )
        updated = conn.execute(
            "SELECT * FROM deployments WHERE id = ?", (deployment_id,)
        ).fetchone()
        dep = row_to_deployment(updated)

    add_activity(
        f"act-{uuid.uuid4().hex[:8]}",
        "deployment",
        f"Rolled back {dep['projectName']} to {dep['version']}",
        datetime.now(timezone.utc).isoformat(),
        "info",
    )
    return dep
