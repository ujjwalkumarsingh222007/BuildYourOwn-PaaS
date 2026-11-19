from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import boto3
from botocore.exceptions import BotoCoreError, ClientError


class AwsSessionStore:
    """
    Holds validated AWS credentials strictly in server process memory.
    Credentials are NEVER persisted to SQLite, disk, or browser storage.
    """

    def __init__(self) -> None:
        self._credentials: Optional[Dict[str, Optional[str]]] = None
        self._metadata: Dict[str, Any] = {"status": "disconnected"}

    def connect(
        self,
        access_key_id: str,
        secret_access_key: str,
        region: str,
        session_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        session_kwargs: Dict[str, Any] = {
            "aws_access_key_id": access_key_id.strip(),
            "aws_secret_access_key": secret_access_key.strip(),
            "region_name": region.strip(),
        }
        if session_token and session_token.strip():
            session_kwargs["aws_session_token"] = session_token.strip()

        try:
            session = boto3.Session(**session_kwargs)
            sts = session.client("sts")
            identity = sts.get_caller_identity()

            # Probe basic service readiness (without mutating AWS resources)
            services = []
            for svc_name in ("ec2", "ecr", "eks"):
                try:
                    client = session.client(svc_name)
                    if svc_name == "ec2":
                        client.describe_regions(RegionNames=[region])
                    elif svc_name == "ecr":
                        client.describe_repositories(maxResults=1)
                    elif svc_name == "eks":
                        client.list_clusters(maxResults=1)
                    services.append({"name": svc_name.upper(), "status": "available", "region": region})
                except ClientError as exc:
                    code = exc.response.get("Error", {}).get("Code", "")
                    status = "limited" if "AccessDenied" in code or "Unauthorized" in code else "available"
                    services.append({"name": svc_name.upper(), "status": status, "region": region})
                except Exception:
                    services.append({"name": svc_name.upper(), "status": "unavailable", "region": region})

            is_temporary = access_key_id.strip().startswith("ASIA") or bool(
                session_token and session_token.strip()
            )

            self._credentials = {
                "access_key_id": access_key_id.strip(),
                "secret_access_key": secret_access_key.strip(),
                "session_token": session_token.strip() if session_token else None,
                "region": region.strip(),
            }
            self._metadata = {
                "status": "connected",
                "accountId": identity.get("Account"),
                "region": region.strip(),
                "iamUser": identity.get("Arn"),
                "connectedAt": datetime.now(timezone.utc).isoformat(),
                "expiresAt": (
                    "Temporary STS session (auto-expires per AWS STS TTL)"
                    if is_temporary
                    else "Long-lived IAM key (no automatic expiration)"
                ),
                "services": services,
            }
            return dict(self._metadata)

        except ClientError as exc:
            error_code = exc.response.get("Error", {}).get("Code", "ClientError")
            error_msg = exc.response.get("Error", {}).get("Message", str(exc))
            if "ExpiredToken" in error_code:
                self._metadata = {"status": "expired"}
                raise ValueError(f"AWS STS Session Token expired: {error_msg}") from exc
            self._metadata = {"status": "error"}
            raise ValueError(f"AWS STS validation failed ({error_code}): {error_msg}") from exc
        except BotoCoreError as exc:
            self._metadata = {"status": "error"}
            raise ValueError(f"AWS client error: {str(exc)}") from exc

    def get_status(self) -> Dict[str, Any]:
        return dict(self._metadata)

    def test_connection(self) -> Dict[str, Any]:
        if not self._credentials:
            return {
                "success": False,
                "message": "No active AWS credentials in backend memory. Submit Access Key, Secret Key, and Session Token first.",
            }
        try:
            kwargs: Dict[str, Any] = {
                "aws_access_key_id": self._credentials["access_key_id"],
                "aws_secret_access_key": self._credentials["secret_access_key"],
                "region_name": self._credentials["region"],
            }
            if self._credentials.get("session_token"):
                kwargs["aws_session_token"] = self._credentials["session_token"]

            sts = boto3.client("sts", **kwargs)
            identity = sts.get_caller_identity()
            return {
                "success": True,
                "message": f"AWS STS verified for account {identity['Account']} ({identity['Arn']})",
            }
        except ClientError as exc:
            code = exc.response.get("Error", {}).get("Code", "")
            if "ExpiredToken" in code:
                self._metadata["status"] = "expired"
            return {
                "success": False,
                "message": exc.response.get("Error", {}).get("Message", str(exc)),
            }
        except Exception as exc:
            return {"success": False, "message": str(exc)}

    def discover_resources(self) -> Dict[str, Any]:
        if not self._credentials:
            return {"connected": False, "vpcs": [], "instances": [], "repositories": [], "clusters": [], "buckets": []}

        kwargs: Dict[str, Any] = {
            "aws_access_key_id": self._credentials["access_key_id"],
            "aws_secret_access_key": self._credentials["secret_access_key"],
            "region_name": self._credentials["region"],
        }
        if self._credentials.get("session_token"):
            kwargs["aws_session_token"] = self._credentials["session_token"]

        session = boto3.Session(**kwargs)
        vpcs, instances, repos, clusters, buckets = [], [], [], [], []

        try:
            ec2 = session.client("ec2")
            for v in ec2.describe_vpcs().get("Vpcs", []):
                vpcs.append({
                    "id": v.get("VpcId"),
                    "cidr": v.get("CidrBlock"),
                    "isDefault": v.get("IsDefault", False),
                })
            for res in ec2.describe_instances().get("Reservations", []):
                for inst in res.get("Instances", []):
                    name_tag = next((t["Value"] for t in inst.get("Tags", []) if t["Key"] == "Name"), inst.get("InstanceId"))
                    instances.append({
                        "id": inst.get("InstanceId"),
                        "name": name_tag,
                        "type": inst.get("InstanceType"),
                        "state": inst.get("State", {}).get("Name"),
                        "publicIp": inst.get("PublicIpAddress"),
                    })
        except Exception:
            pass

        try:
            ecr = session.client("ecr")
            for r in ecr.describe_repositories().get("repositories", []):
                repos.append({
                    "name": r.get("repositoryName"),
                    "uri": r.get("repositoryUri"),
                })
        except Exception:
            pass

        try:
            eks = session.client("eks")
            clusters = eks.list_clusters().get("clusters", [])
        except Exception:
            pass

        try:
            s3 = session.client("s3")
            for b in s3.list_buckets().get("Buckets", []):
                buckets.append({"name": b.get("Name")})
        except Exception:
            pass

        return {
            "connected": True,
            "region": self._credentials["region"],
            "vpcs": vpcs,
            "instances": instances,
            "repositories": repos,
            "clusters": clusters,
            "buckets": buckets,
        }

    def upload_directory_to_s3(self, bucket: str, prefix: str, source_dir: Path) -> List[str]:
        if not self._credentials:
            raise ValueError("AWS session is not connected. Connect your AWS temporary session first.")
        if not source_dir.exists():
            raise FileNotFoundError(f"Workspace directory not found: {source_dir}")

        kwargs: Dict[str, Any] = {
            "aws_access_key_id": self._credentials["access_key_id"],
            "aws_secret_access_key": self._credentials["secret_access_key"],
            "region_name": self._credentials["region"],
        }
        if self._credentials.get("session_token"):
            kwargs["aws_session_token"] = self._credentials["session_token"]

        s3 = boto3.client("s3", **kwargs)
        uploaded: List[str] = []
        for file_path in source_dir.rglob("*"):
            if file_path.is_file():
                rel = file_path.relative_to(source_dir).as_posix()
                key = f"{prefix.rstrip('/')}/{rel}"
                s3.upload_file(str(file_path), bucket, key)
                uploaded.append(f"s3://{bucket}/{key}")
        return uploaded

    def disconnect(self) -> None:
        self._credentials = None
        self._metadata = {"status": "disconnected"}


aws_session_store = AwsSessionStore()
