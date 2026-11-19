import json
import uuid
import zipfile
from datetime import datetime, timezone
from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile
from app.config import UPLOADS_DIR
from app.database import add_activity, get_conn, row_to_deployment, row_to_project
from app.models import (
    DeploymentResponse,
    ProjectCreateRequest,
    ProjectResponse,
    ProjectStatusUpdateRequest,
)
from app.services.pipeline_service import run_deployment_pipeline

router = APIRouter(prefix="/projects", tags=["projects"])

MAX_ZIP_BYTES = 50 * 1024 * 1024  # 50 MB


@router.get("", response_model=list[ProjectResponse])
def list_projects():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM projects ORDER BY created_at DESC"
        ).fetchall()
        return [row_to_project(r) for r in rows]


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        return row_to_project(row)


@router.post("/upload-zip")
async def upload_project_zip(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip archives are accepted")

    content = await file.read()
    if len(content) > MAX_ZIP_BYTES:
        raise HTTPException(status_code=400, detail="ZIP archive exceeds 50 MB limit")

    upload_id = f"zip-{uuid.uuid4().hex[:10]}"
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    dest_path = UPLOADS_DIR / f"{upload_id}.zip"
    dest_path.write_bytes(content)

    if not zipfile.is_zipfile(dest_path):
        dest_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid ZIP archive")

    with zipfile.ZipFile(dest_path, "r") as zf:
        names = [n for n in zf.namelist() if not n.endswith("/")]

    return {
        "zipUploadId": upload_id,
        "filename": file.filename,
        "sizeBytes": len(content),
        "fileCount": len(names),
        "sampleFiles": names[:10],
    }


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(payload: ProjectCreateRequest, background_tasks: BackgroundTasks):
    now_iso = datetime.now(timezone.utc).isoformat()
    project_id = f"proj-{uuid.uuid4().hex[:8]}"
    slug = "".join(c if c.isalnum() or c == "-" else "-" for c in payload.name.lower()).strip("-") or project_id

    project_data = {
        "id": project_id,
        "name": payload.name.strip(),
        "description": payload.description.strip() or f"{payload.framework} application",
        "framework": payload.framework,
        "status": "building",
        "source": payload.source,
        "repositoryUrl": payload.repositoryUrl,
        "branch": payload.branch or "main",
        "lastDeployedAt": now_iso,
        "createdAt": now_iso,
        "url": f"http://127.0.0.1:8000/apps/{slug}",
        "cpu": payload.cpu,
        "memory": payload.memory,
        "replicas": payload.replicas,
        "envVars": [e.model_dump() for e in payload.envVars],
        "buildCommand": payload.buildCommand,
        "startCommand": payload.startCommand,
        "rootDirectory": payload.rootDirectory,
    }

    dep_id = f"dep-{uuid.uuid4().hex[:8]}"
    version = "v1.0.0"
    source_detail = (
        f"GitHub: {payload.repositoryUrl} ({payload.branch or 'main'})"
        if payload.source == "github"
        else f"ZIP Upload ID: {payload.zipUploadId or 'local-archive'}"
    )
    build_logs = [
        {"timestamp": now_iso, "level": "info", "message": f"Queued deployment {dep_id} ({version})"},
    ]
    config_obj = {
        "framework": payload.framework,
        "buildCommand": payload.buildCommand,
        "startCommand": payload.startCommand,
        "rootDirectory": payload.rootDirectory,
        "cpu": payload.cpu,
        "memory": payload.memory,
        "replicas": payload.replicas,
        "envVars": [e.model_dump() for e in payload.envVars],
    }

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO projects (
                id, name, description, framework, status, source, repository_url, branch,
                last_deployed_at, created_at, url, cpu, memory, replicas, env_vars_json,
                build_command, start_command, root_directory
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                project_data["id"],
                project_data["name"],
                project_data["description"],
                project_data["framework"],
                project_data["status"],
                project_data["source"],
                project_data["repositoryUrl"],
                project_data["branch"],
                project_data["lastDeployedAt"],
                project_data["createdAt"],
                project_data["url"],
                project_data["cpu"],
                project_data["memory"],
                project_data["replicas"],
                json.dumps(project_data["envVars"]),
                project_data["buildCommand"],
                project_data["startCommand"],
                project_data["rootDirectory"],
            ),
        )
        conn.execute(
            """
            INSERT INTO deployments (
                id, project_id, project_name, status, source, commit_hash, commit_message,
                branch, version, created_at, started_at, completed_at, duration,
                build_logs_json, runtime_logs_json, configuration_json, artifacts_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                dep_id,
                project_id,
                project_data["name"],
                "building",
                payload.source,
                None,
                source_detail,
                payload.branch or "main",
                version,
                now_iso,
                now_iso,
                None,
                None,
                json.dumps(build_logs),
                json.dumps([]),
                json.dumps(config_obj),
                json.dumps({}),
            ),
        )

    add_activity(
        f"act-{uuid.uuid4().hex[:8]}",
        "project",
        f"Created project {project_data['name']} and queued {version} build",
        now_iso,
        "info",
    )

    background_tasks.add_task(
        run_deployment_pipeline,
        dep_id,
        project_data,
        version,
        payload.zipUploadId,
    )

    return project_data


@router.post("/{project_id}/deploy", response_model=DeploymentResponse, status_code=201)
def trigger_redeploy(project_id: str, background_tasks: BackgroundTasks):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        project = row_to_project(row)
        dep_count = conn.execute(
            "SELECT COUNT(*) FROM deployments WHERE project_id = ?", (project_id,)
        ).fetchone()[0]

        now_iso = datetime.now(timezone.utc).isoformat()
        dep_id = f"dep-{uuid.uuid4().hex[:8]}"
        version = f"v1.0.{dep_count}"
        build_logs = [
            {"timestamp": now_iso, "level": "info", "message": f"Triggered redeploy {dep_id} ({version})"},
        ]
        config_obj = {
            "framework": project["framework"],
            "buildCommand": project["buildCommand"],
            "startCommand": project["startCommand"],
            "rootDirectory": project["rootDirectory"],
            "cpu": project["cpu"],
            "memory": project["memory"],
            "replicas": project["replicas"],
            "envVars": project["envVars"],
        }

        conn.execute(
            "UPDATE projects SET status = ? WHERE id = ?",
            ("building", project_id),
        )
        conn.execute(
            """
            INSERT INTO deployments (
                id, project_id, project_name, status, source, commit_hash, commit_message,
                branch, version, created_at, started_at, completed_at, duration,
                build_logs_json, runtime_logs_json, configuration_json, artifacts_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                dep_id,
                project_id,
                project["name"],
                "building",
                project["source"],
                None,
                f"Manual redeploy ({version})",
                project.get("branch") or "main",
                version,
                now_iso,
                now_iso,
                None,
                None,
                json.dumps(build_logs),
                json.dumps([]),
                json.dumps(config_obj),
                json.dumps({}),
            ),
        )
        dep_row = conn.execute("SELECT * FROM deployments WHERE id = ?", (dep_id,)).fetchone()
        dep_resp = row_to_deployment(dep_row)

    background_tasks.add_task(run_deployment_pipeline, dep_id, project, version, None)
    return dep_resp


@router.patch("/{project_id}/status", response_model=ProjectResponse)
def update_project_status(project_id: str, payload: ProjectStatusUpdateRequest):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        conn.execute(
            "UPDATE projects SET status = ? WHERE id = ?",
            (payload.status, project_id),
        )
        updated = conn.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
        return row_to_project(updated)


@router.delete("/{project_id}")
def delete_project(project_id: str):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT name FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        conn.execute("DELETE FROM deployments WHERE project_id = ?", (project_id,))
        conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    add_activity(
        f"act-{uuid.uuid4().hex[:8]}",
        "project",
        f"Deleted project {row['name']}",
        datetime.now(timezone.utc).isoformat(),
        "info",
    )
    return {"deleted": True, "id": project_id}
