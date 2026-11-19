import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
WORKSPACES_DIR = DATA_DIR / "workspaces"
DB_PATH = Path(os.getenv("BYO_DB_PATH", str(DATA_DIR / "paas.db")))

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

KUBECONFIG_PATH = os.getenv("KUBECONFIG", "").strip()
API_V1_PREFIX = "/api/v1"
