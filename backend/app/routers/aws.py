from datetime import datetime, timezone
from pathlib import Path
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import WORKSPACES_DIR
from app.database import add_activity, get_conn, row_to_deployment
from app.models import AwsConnectRequest, AwsConnectionResponse
from app.services.aws_service import aws_session_store

router = APIRouter(prefix="/aws", tags=["aws"])


class S3UploadRequest(BaseModel):
    deploymentId: str
    bucket: str


@router.get("/status", response_model=AwsConnectionResponse)
def get_aws_status():
    return aws_session_store.get_status()


@router.post("/connect", response_model=AwsConnectionResponse)
def connect_aws(payload: AwsConnectRequest):
    try:
        result = aws_session_store.connect(
            access_key_id=payload.accessKeyId,
            secret_access_key=payload.secretAccessKey,
            region=payload.region,
            session_token=payload.sessionToken,
        )
        add_activity(
            f"act-{uuid.uuid4().hex[:8]}",
            "infrastructure",
            f"Connected AWS account {result.get('accountId')} in {payload.region}",
            datetime.now(timezone.utc).isoformat(),
            "success",
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))


@router.post("/test")
def test_aws_connection():
    return aws_session_store.test_connection()


@router.get("/resources")
def get_aws_resources():
    return aws_session_store.discover_resources()


@router.post("/upload-deployment")
def upload_deployment_to_s3(payload: S3UploadRequest):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM deployments WHERE id = ?", (payload.deploymentId,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Deployment not found")
        dep = row_to_deployment(row)

    workspace_dir = WORKSPACES_DIR / dep["projectId"] / dep["version"]
    if not workspace_dir.exists():
        raise HTTPException(status_code=404, detail="Deployment workspace directory not found")

    prefix = f"byo-paas/{dep['projectName']}/{dep['version']}"
    try:
        uploaded = aws_session_store.upload_directory_to_s3(
            bucket=payload.bucket.strip(),
            prefix=prefix,
            source_dir=Path(workspace_dir),
        )
        add_activity(
            f"act-{uuid.uuid4().hex[:8]}",
            "deployment",
            f"Uploaded {len(uploaded)} artifact(s) for {dep['projectName']} {dep['version']} to s3://{payload.bucket}/{prefix}",
            datetime.now(timezone.utc).isoformat(),
            "success",
        )
        return {
            "bucket": payload.bucket.strip(),
            "prefix": prefix,
            "uploadedCount": len(uploaded),
            "s3Uris": uploaded[:25],
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/disconnect")
def disconnect_aws():
    aws_session_store.disconnect()
    add_activity(
        f"act-{uuid.uuid4().hex[:8]}",
        "infrastructure",
        "Disconnected AWS STS session from backend memory",
        datetime.now(timezone.utc).isoformat(),
        "info",
    )
    return {"status": "disconnected"}
