import json
import sqlite3
from contextlib import contextmanager
from typing import Any, Dict, List, Optional
from app.config import DATA_DIR, DB_PATH, UPLOADS_DIR, WORKSPACES_DIR


def init_db() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    WORKSPACES_DIR.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                framework TEXT NOT NULL,
                status TEXT NOT NULL,
                source TEXT NOT NULL,
                repository_url TEXT,
                branch TEXT,
                last_deployed_at TEXT NOT NULL,
                created_at TEXT NOT NULL,
                url TEXT,
                cpu TEXT NOT NULL,
                memory TEXT NOT NULL,
                replicas INTEGER NOT NULL,
                env_vars_json TEXT NOT NULL,
                build_command TEXT NOT NULL,
                start_command TEXT NOT NULL,
                root_directory TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS deployments (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                project_name TEXT NOT NULL,
                status TEXT NOT NULL,
                source TEXT NOT NULL,
                commit_hash TEXT,
                commit_message TEXT,
                branch TEXT,
                version TEXT NOT NULL,
                created_at TEXT NOT NULL,
                started_at TEXT,
                completed_at TEXT,
                duration TEXT,
                build_logs_json TEXT NOT NULL,
                runtime_logs_json TEXT NOT NULL,
                configuration_json TEXT NOT NULL,
                artifacts_json TEXT NOT NULL DEFAULT '{}'
            )
            """
        )
        # Ensure artifacts_json exists on existing DBs
        cols = [r[1] for r in conn.execute("PRAGMA table_info(deployments)").fetchall()]
        if "artifacts_json" not in cols:
            conn.execute(
                "ALTER TABLE deployments ADD COLUMN artifacts_json TEXT NOT NULL DEFAULT '{}'"
            )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS activity (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                status TEXT NOT NULL
            )
            """
        )
        conn.commit()


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def row_to_project(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "framework": row["framework"],
        "status": row["status"],
        "source": row["source"],
        "repositoryUrl": row["repository_url"],
        "branch": row["branch"],
        "lastDeployedAt": row["last_deployed_at"],
        "createdAt": row["created_at"],
        "url": row["url"],
        "cpu": row["cpu"],
        "memory": row["memory"],
        "replicas": row["replicas"],
        "envVars": json.loads(row["env_vars_json"]),
        "buildCommand": row["build_command"],
        "startCommand": row["start_command"],
        "rootDirectory": row["root_directory"],
    }


def row_to_deployment(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "projectId": row["project_id"],
        "projectName": row["project_name"],
        "status": row["status"],
        "source": row["source"],
        "commitHash": row["commit_hash"],
        "commitMessage": row["commit_message"],
        "branch": row["branch"],
        "version": row["version"],
        "createdAt": row["created_at"],
        "startedAt": row["started_at"],
        "completedAt": row["completed_at"],
        "duration": row["duration"],
        "buildLogs": json.loads(row["build_logs_json"]),
        "runtimeLogs": json.loads(row["runtime_logs_json"]),
        "configuration": json.loads(row["configuration_json"]),
        "artifacts": json.loads(row["artifacts_json"] or "{}"),
    }


def add_activity(act_id: str, act_type: str, message: str, timestamp: str, status: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO activity (id, type, message, timestamp, status) VALUES (?, ?, ?, ?, ?)",
            (act_id, act_type, message, timestamp, status),
        )


def list_activity(limit: int = 20) -> List[Dict[str, Any]]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, type, message, timestamp, status FROM activity ORDER BY timestamp DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]
