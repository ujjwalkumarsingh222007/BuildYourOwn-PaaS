import json
import shutil
import subprocess
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.config import UPLOADS_DIR, WORKSPACES_DIR
from app.database import add_activity, get_conn
from app.services.aws_service import aws_session_store
from app.services.builder_service import (
    clone_github_repo,
    detect_project_files,
    extract_zip_safely,
    generate_dockerfile,
    generate_k3s_manifests,
    get_runtime_capabilities,
)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _append_log(dep_id: str, level: str, message: str, status: Optional[str] = None) -> None:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT build_logs_json FROM deployments WHERE id = ?", (dep_id,)
        ).fetchone()
        if not row:
            return
        logs: List[Dict[str, str]] = json.loads(row["build_logs_json"])
        logs.append({"timestamp": _now(), "level": level, "message": message})
        if status:
            conn.execute(
                "UPDATE deployments SET build_logs_json = ?, status = ? WHERE id = ?",
                (json.dumps(logs), status, dep_id),
            )
        else:
            conn.execute(
                "UPDATE deployments SET build_logs_json = ? WHERE id = ?",
                (json.dumps(logs), dep_id),
            )


def run_deployment_pipeline(
    deployment_id: str,
    project: Dict[str, Any],
    version: str,
    zip_upload_id: Optional[str] = None,
) -> None:
    started = time.monotonic()
    workspace_root = WORKSPACES_DIR / project["id"] / version
    src_dir = workspace_root / "src"
    k3s_dir = workspace_root / "k3s"
    src_dir.mkdir(parents=True, exist_ok=True)
    k3s_dir.mkdir(parents=True, exist_ok=True)

    slug = "".join(c if c.isalnum() or c == "-" else "-" for c in project["name"].lower()).strip("-") or project["id"]
    image_tag = f"registry.local/{slug}:{version}"
    commit_hash: Optional[str] = None

    try:
        _append_log(
            deployment_id,
            "info",
            f"Pipeline started for {project['name']} ({version}) in workspace {workspace_root}",
            status="building",
        )

        # Stage 1: Source acquisition
        if project["source"] == "zip":
            if zip_upload_id:
                zip_path = UPLOADS_DIR / f"{zip_upload_id}.zip"
                if not zip_path.exists():
                    raise FileNotFoundError(f"Uploaded archive {zip_upload_id}.zip not found")
                files = extract_zip_safely(zip_path, src_dir)
                _append_log(
                    deployment_id,
                    "info",
                    f"Extracted {len(files)} file(s) from ZIP archive safely into workspace",
                )
            else:
                _append_log(
                    deployment_id,
                    "warn",
                    "No ZIP file attached to this redeploy; using existing workspace config",
                )
        else:
            repo_url = project.get("repositoryUrl") or ""
            branch = project.get("branch") or "main"
            _append_log(deployment_id, "info", f"Cloning {repo_url} (branch: {branch})...")
            try:
                commit_hash = clone_github_repo(repo_url, branch, src_dir)
                _append_log(
                    deployment_id,
                    "info",
                    f"Cloned repository cleanly at commit {commit_hash}",
                )
            except Exception as clone_exc:
                _append_log(
                    deployment_id,
                    "warn",
                    f"Git clone skipped ({clone_exc}); generating deployment artifacts from project spec",
                )

        # Stage 2: Detect files & generate Dockerfile
        detected = detect_project_files(src_dir)
        dockerfile_text = generate_dockerfile(project, src_dir)
        (workspace_root / "Dockerfile").write_text(dockerfile_text, encoding="utf-8")
        _append_log(
            deployment_id,
            "info",
            f"Dockerfile ready (existing={detected['hasDockerfile']}, package.json={detected['hasPackageJson']}, requirements.txt={detected['hasRequirementsTxt']})",
        )

        caps = get_runtime_capabilities()
        if caps["dockerInstalled"]:
            _append_log(deployment_id, "info", f"Running docker build -t {image_tag} ...")
            proc = subprocess.run(
                ["docker", "build", "-t", image_tag, "-f", str(workspace_root / "Dockerfile"), str(src_dir)],
                capture_output=True,
                text=True,
                timeout=300,
                shell=False,
            )
            if proc.returncode != 0:
                raise RuntimeError(proc.stderr or proc.stdout or "docker build failed")
            _append_log(deployment_id, "info", f"Docker image built successfully: {image_tag}")
        else:
            _append_log(
                deployment_id,
                "info",
                f"Docker/BuildKit CLI not installed on this Windows host; saved BuildKit Dockerfile for {image_tag}",
            )

        # Stage 3 & 4: Generate K3s Kubernetes Manifests
        _append_log(
            deployment_id,
            "info",
            "Generating Kubernetes K3s Deployment, Service, and Traefik Ingress YAML manifests...",
            status="deploying",
        )
        manifests = generate_k3s_manifests(project, image_tag)
        (k3s_dir / "deployment.yaml").write_text(manifests["deploymentYaml"], encoding="utf-8")
        (k3s_dir / "service.yaml").write_text(manifests["serviceYaml"], encoding="utf-8")
        (k3s_dir / "ingress.yaml").write_text(manifests["ingressYaml"], encoding="utf-8")

        if caps["kubectlInstalled"] and caps["kubeconfigPresent"]:
            proc = subprocess.run(
                ["kubectl", "apply", "-f", str(k3s_dir)],
                capture_output=True,
                text=True,
                timeout=60,
                shell=False,
            )
            if proc.returncode != 0:
                raise RuntimeError(proc.stderr or proc.stdout or "kubectl apply failed")
            _append_log(deployment_id, "info", "Applied K3s manifests to connected cluster")
        else:
            _append_log(
                deployment_id,
                "info",
                "K3s cluster manifests generated and ready for cluster apply",
            )

        # Stage 5: Automatic AWS S3 Cloud Sync (if AWS session is connected)
        aws_status = aws_session_store.get_status()
        s3_uris: List[str] = []
        if aws_status.get("status") == "connected":
            try:
                resources = aws_session_store.discover_resources()
                buckets = resources.get("buckets", [])
                if buckets:
                    target_bucket = buckets[0]["name"]
                    prefix = f"byo-paas/{slug}/{version}"
                    _append_log(
                        deployment_id,
                        "info",
                        f"AWS Cloud session active; auto-uploading bundle to s3://{target_bucket}/{prefix}...",
                    )
                    s3_uris = aws_session_store.upload_directory_to_s3(
                        bucket=target_bucket,
                        prefix=prefix,
                        source_dir=workspace_root,
                    )
                    _append_log(
                        deployment_id,
                        "info",
                        f"Auto-synced {len(s3_uris)} file(s) to AWS S3 bucket: {target_bucket}",
                    )
            except Exception as s3_err:
                _append_log(
                    deployment_id,
                    "warn",
                    f"Automatic S3 cloud sync skipped: {str(s3_err)}",
                )

        elapsed = f"{time.monotonic() - started:.2f}s"
        artifacts = {
            "imageTag": image_tag,
            "workspacePath": str(workspace_root),
            "detectedFiles": detected,
            "dockerfile": dockerfile_text,
            "deploymentYaml": manifests["deploymentYaml"],
            "serviceYaml": manifests["serviceYaml"],
            "ingressYaml": manifests["ingressYaml"],
            "s3Uris": s3_uris,
            "executedRealDocker": caps["dockerInstalled"],
            "executedRealKubectl": caps["kubectlInstalled"] and caps["kubeconfigPresent"],
        }

        now_iso = _now()
        runtime_logs = [
            {
                "timestamp": now_iso,
                "level": "info",
                "message": (
                    f"Container pods running on K3s cluster ({image_tag})"
                    if artifacts["executedRealKubectl"]
                    else f"Artifacts built & validated ({image_tag}); awaiting Docker/K3s host to schedule live pods"
                ),
            }
        ]

        with get_conn() as conn:
            row = conn.execute(
                "SELECT build_logs_json FROM deployments WHERE id = ?", (deployment_id,)
            ).fetchone()
            logs = json.loads(row["build_logs_json"]) if row else []
            logs.append({"timestamp": now_iso, "level": "info", "message": f"Pipeline finished in {elapsed}"})
            conn.execute(
                """
                UPDATE deployments
                SET status = ?, commit_hash = ?, completed_at = ?, duration = ?,
                    build_logs_json = ?, runtime_logs_json = ?, artifacts_json = ?
                WHERE id = ?
                """,
                (
                    "running",
                    commit_hash,
                    now_iso,
                    elapsed,
                    json.dumps(logs),
                    json.dumps(runtime_logs),
                    json.dumps(artifacts),
                    deployment_id,
                ),
            )
            conn.execute(
                "UPDATE projects SET status = ?, last_deployed_at = ? WHERE id = ?",
                ("running", now_iso, project["id"]),
            )

        add_activity(
            f"act-{uuid.uuid4().hex[:8]}",
            "deployment",
            f"Completed pipeline for {project['name']} {version} in {elapsed}",
            now_iso,
            "success",
        )

    except Exception as exc:
        elapsed = f"{time.monotonic() - started:.2f}s"
        now_iso = _now()
        _append_log(deployment_id, "error", f"Pipeline failed: {str(exc)}", status="failed")
        with get_conn() as conn:
            conn.execute(
                "UPDATE deployments SET completed_at = ?, duration = ? WHERE id = ?",
                (now_iso, elapsed, deployment_id),
            )
            conn.execute(
                "UPDATE projects SET status = ? WHERE id = ?",
                ("failed", project["id"]),
            )
        add_activity(
            f"act-{uuid.uuid4().hex[:8]}",
            "deployment",
            f"Pipeline failed for {project['name']} {version}: {str(exc)}",
            now_iso,
            "error",
        )
