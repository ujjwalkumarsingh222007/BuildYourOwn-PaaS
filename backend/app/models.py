from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class EnvVarSchema(BaseModel):
    key: str
    value: str
    isSecret: bool = False


class ProjectCreateRequest(BaseModel):
    source: Literal["github", "zip"]
    repositoryUrl: Optional[str] = None
    branch: Optional[str] = "main"
    zipUploadId: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=64)
    description: str = ""
    framework: str = "nextjs"
    buildCommand: str = "npm run build"
    startCommand: str = "npm start"
    rootDirectory: str = "/"
    cpu: str = "500m"
    memory: str = "512Mi"
    replicas: int = Field(default=1, ge=1, le=20)
    envVars: List[EnvVarSchema] = []


class ProjectStatusUpdateRequest(BaseModel):
    status: Literal["running", "stopped", "deploying", "failed", "building"]


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str
    framework: str
    status: str
    source: str
    repositoryUrl: Optional[str] = None
    branch: Optional[str] = None
    lastDeployedAt: str
    createdAt: str
    url: Optional[str] = None
    cpu: str
    memory: str
    replicas: int
    envVars: List[EnvVarSchema]
    buildCommand: str
    startCommand: str
    rootDirectory: str


class LogEntrySchema(BaseModel):
    timestamp: str
    level: Literal["info", "warn", "error", "debug"]
    message: str


class DeploymentConfigurationSchema(BaseModel):
    framework: str
    buildCommand: str
    startCommand: str
    rootDirectory: str
    cpu: str
    memory: str
    replicas: int
    envVars: List[EnvVarSchema] = []


class DeploymentResponse(BaseModel):
    id: str
    projectId: str
    projectName: str
    status: str
    source: str
    commitHash: Optional[str] = None
    commitMessage: Optional[str] = None
    branch: Optional[str] = None
    version: str
    createdAt: str
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None
    duration: Optional[str] = None
    buildLogs: List[LogEntrySchema]
    runtimeLogs: List[LogEntrySchema]
    configuration: DeploymentConfigurationSchema
    artifacts: Optional[Dict[str, Any]] = None


class AwsConnectRequest(BaseModel):
    accessKeyId: str = Field(..., min_length=16, max_length=128)
    secretAccessKey: str = Field(..., min_length=20)
    sessionToken: Optional[str] = None
    region: str = Field(..., min_length=1)


class AwsServiceStatusSchema(BaseModel):
    name: str
    status: Literal["available", "unavailable", "limited"]
    region: str


class AwsConnectionResponse(BaseModel):
    status: Literal["connected", "disconnected", "error", "expired"]
    accountId: Optional[str] = None
    region: Optional[str] = None
    iamUser: Optional[str] = None
    connectedAt: Optional[str] = None
    expiresAt: Optional[str] = None
    services: Optional[List[AwsServiceStatusSchema]] = None
