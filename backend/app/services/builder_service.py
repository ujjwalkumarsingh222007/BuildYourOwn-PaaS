import shutil
import subprocess
import zipfile
from pathlib import Path
from typing import Any, Dict, List
from app.config import KUBECONFIG_PATH


def get_runtime_capabilities() -> Dict[str, Any]:
    kube_path = Path(KUBECONFIG_PATH) if KUBECONFIG_PATH else Path.home() / ".kube" / "config"
    return {
        "gitInstalled": shutil.which("git") is not None,
        "dockerInstalled": shutil.which("docker") is not None,
        "kubectlInstalled": shutil.which("kubectl") is not None,
        "kubeconfigPresent": kube_path.exists(),
        "kubeconfigPath": str(kube_path),
    }


def extract_zip_safely(zip_path: Path, target_dir: Path) -> List[str]:
    """Extracts a ZIP archive into target_dir while blocking Zip Slip path traversal."""
    target_dir.mkdir(parents=True, exist_ok=True)
    target_root = target_dir.resolve()
    extracted: List[str] = []

    with zipfile.ZipFile(zip_path, "r") as zf:
        for member in zf.infolist():
            dest_path = (target_root / member.filename).resolve()
            if not str(dest_path).startswith(str(target_root)):
                raise ValueError(f"Blocked unsafe ZIP entry path: {member.filename}")
            if member.is_dir():
                dest_path.mkdir(parents=True, exist_ok=True)
            else:
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(member, "r") as src, open(dest_path, "wb") as dst:
                    shutil.copyfileobj(src, dst)
                extracted.append(member.filename)
    return extracted


def clone_github_repo(repo_url: str, branch: str, target_dir: Path) -> str:
    """Clones a Git repository using shallow depth=1 without shell interpolation."""
    if shutil.which("git") is None:
        raise RuntimeError("git CLI is not installed on host")
    if not (repo_url.startswith("https://") or repo_url.startswith("http://")):
        raise ValueError("Repository URL must start with https:// or http://")

    if target_dir.exists():
        shutil.rmtree(target_dir, ignore_errors=True)
    target_dir.parent.mkdir(parents=True, exist_ok=True)

    cmd = ["git", "clone", "--depth", "1", "--branch", branch, repo_url, str(target_dir)]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60, shell=False)
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "git clone failed").strip()
        raise RuntimeError(err)

    rev_proc = subprocess.run(
        ["git", "-C", str(target_dir), "rev-parse", "--short", "HEAD"],
        capture_output=True,
        text=True,
        timeout=10,
        shell=False,
    )
    return rev_proc.stdout.strip() if rev_proc.returncode == 0 else "HEAD"


def detect_project_files(src_dir: Path) -> Dict[str, bool]:
    return {
        "hasDockerfile": (src_dir / "Dockerfile").exists(),
        "hasPackageJson": (src_dir / "package.json").exists(),
        "hasRequirementsTxt": (src_dir / "requirements.txt").exists(),
        "hasPyprojectToml": (src_dir / "pyproject.toml").exists(),
        "hasGoMod": (src_dir / "go.mod").exists(),
        "hasCargoToml": (src_dir / "Cargo.toml").exists(),
        "hasIndexHtml": (src_dir / "index.html").exists(),
    }


def generate_dockerfile(project: Dict[str, Any], src_dir: Path) -> str:
    existing = src_dir / "Dockerfile"
    if existing.exists():
        return existing.read_text(encoding="utf-8", errors="replace")

    fw = project.get("framework", "nextjs").lower()
    build_cmd = project.get("buildCommand", "npm run build")
    start_cmd = project.get("startCommand", "npm start")
    root_dir = project.get("rootDirectory", "/").lstrip("/") or "."

    if fw in ("nextjs", "react", "vue", "angular", "express"):
        return f"""# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS builder
WORKDIR /app/{root_dir}
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN {build_cmd}

FROM node:20-alpine AS runner
WORKDIR /app/{root_dir}
ENV NODE_ENV=production
COPY --from=builder /app/{root_dir} .
EXPOSE 3000
CMD ["sh", "-c", "{start_cmd}"]
"""
    if fw in ("fastapi", "django", "flask"):
        return f"""# syntax=docker/dockerfile:1.7
FROM python:3.12-slim
WORKDIR /app/{root_dir}
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements*.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "{start_cmd}"]
"""
    if fw == "go":
        return f"""# syntax=docker/dockerfile:1.7
FROM golang:1.23-alpine AS builder
WORKDIR /src
COPY go.* ./
RUN go mod download
COPY . .
RUN {build_cmd}

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /src/main /app/main
EXPOSE 8080
CMD ["./main"]
"""
    if fw == "rust":
        return f"""# syntax=docker/dockerfile:1.7
FROM rust:1.82-alpine AS builder
WORKDIR /src
COPY . .
RUN {build_cmd}

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /src/target/release/app /app/app
EXPOSE 8080
CMD ["./app"]
"""
    return """# syntax=docker/dockerfile:1.7
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
"""


def _parse_port(framework: str) -> int:
    fw = framework.lower()
    if fw in ("fastapi", "django", "flask"):
        return 8000
    if fw in ("go", "rust"):
        return 8080
    if fw == "static":
        return 80
    return 3000


def generate_k3s_manifests(project: Dict[str, Any], image_tag: str) -> Dict[str, str]:
    slug = "".join(c if c.isalnum() or c == "-" else "-" for c in project["name"].lower()).strip("-") or project["id"]
    port = _parse_port(project.get("framework", "nextjs"))
    cpu = project.get("cpu", "500m")
    memory = project.get("memory", "512Mi")
    replicas = int(project.get("replicas", 1))
    host = f"{slug}.byo-paas.local"

    env_block = ""
    env_vars = project.get("envVars", [])
    if env_vars:
        lines = ["          env:"]
        for ev in env_vars:
            safe_val = str(ev["value"]).replace('"', '\\"')
            lines.append(f'            - name: {ev["key"]}')
            lines.append(f'              value: "{safe_val}"')
        env_block = "\n" + "\n".join(lines)

    deployment_yaml = f"""apiVersion: apps/v1
kind: Deployment
metadata:
  name: {slug}
  namespace: production
  labels:
    app: {slug}
    managed-by: buildyourown-paas
spec:
  replicas: {replicas}
  selector:
    matchLabels:
      app: {slug}
  template:
    metadata:
      labels:
        app: {slug}
    spec:
      containers:
        - name: {slug}
          image: {image_tag}
          ports:
            - containerPort: {port}{env_block}
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "{cpu}"
              memory: "{memory}"
          readinessProbe:
            tcpSocket:
              port: {port}
            initialDelaySeconds: 5
            periodSeconds: 10
"""

    service_yaml = f"""apiVersion: v1
kind: Service
metadata:
  name: {slug}-svc
  namespace: production
  labels:
    app: {slug}
spec:
  type: ClusterIP
  selector:
    app: {slug}
  ports:
    - name: http
      port: 80
      targetPort: {port}
"""

    ingress_yaml = f"""apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {slug}-ingress
  namespace: production
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  rules:
    - host: {host}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: {slug}-svc
                port:
                  number: 80
"""

    return {
        "deploymentYaml": deployment_yaml,
        "serviceYaml": service_yaml,
        "ingressYaml": ingress_yaml,
    }
