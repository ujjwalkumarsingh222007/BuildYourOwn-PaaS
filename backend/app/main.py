import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from app.config import API_V1_PREFIX, CORS_ORIGINS, WORKSPACES_DIR
from app.database import get_conn, init_db
from app.routers import aws, dashboard, deployments, health, infrastructure, projects


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="BuildYourOwn PaaS API",
    version="1.0.0",
    description="FastAPI Control Plane for BuildYourOwn PaaS (Phase 1B)",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=API_V1_PREFIX)
app.include_router(dashboard.router, prefix=API_V1_PREFIX)
app.include_router(projects.router, prefix=API_V1_PREFIX)
app.include_router(deployments.router, prefix=API_V1_PREFIX)
app.include_router(aws.router, prefix=API_V1_PREFIX)
app.include_router(infrastructure.router, prefix=API_V1_PREFIX)


@app.get("/apps/{project_slug}")
@app.get("/apps/{project_slug}/{subpath:path}")
def serve_deployed_app(project_slug: str, subpath: str = ""):
    """Live preview endpoint for deployed apps directly from the PaaS control plane."""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, name, framework FROM projects WHERE id = ? OR LOWER(REPLACE(name, ' ', '-')) = ?",
            (project_slug, project_slug.lower()),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="App not found on this PaaS")
        proj_id = row["id"]

        dep = conn.execute(
            "SELECT version FROM deployments WHERE project_id = ? ORDER BY created_at DESC LIMIT 1",
            (proj_id,),
        ).fetchone()
        if not dep:
            raise HTTPException(status_code=404, detail="No deployment found for this project")
        version = dep["version"]

    workspace = WORKSPACES_DIR / proj_id / version
    if not workspace.exists():
        raise HTTPException(status_code=404, detail="Workspace directory not found")

    target = workspace / subpath if subpath else workspace
    if target.is_dir():
        # Look for index.html or any html file
        index_candidates = [
            target / "index.html",
            target / "src" / "index.html",
            target / "src" / "Delete_ollama.html",
        ]
        html_files = list(target.rglob("*.html"))
        if html_files:
            return FileResponse(str(html_files[0]))
        return HTMLResponse(
            f"<h2>BuildYourOwn PaaS: {row['name']} ({version}) is live!</h2><p>Files deployed to container workspace: {workspace}</p>"
        )

    if target.exists() and target.is_file():
        return FileResponse(str(target))

    raise HTTPException(status_code=404, detail="File not found in application workspace")


@app.get("/")
def root():
    return {
        "service": "BuildYourOwn PaaS FastAPI Control Plane",
        "docs": "/docs",
        "apiBase": API_V1_PREFIX,
    }
