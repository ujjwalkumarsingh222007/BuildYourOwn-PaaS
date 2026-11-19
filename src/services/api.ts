// ============================================================================
// API SERVICE LAYER — PHASE 1B (FastAPI Control Plane Integration)
// Connects to NEXT_PUBLIC_API_URL (default: http://localhost:8000/api/v1).
// ============================================================================

import type {
  Project,
  ProjectStatus,
  Deployment,
  DashboardStats,
  ChartDataPoint,
  ActivityItem,
  ClusterHealth,
  InfrastructureNode,
  K8sPod,
  K8sService,
  K8sNamespace,
  CreateProjectFormData,
  AwsConnection,
  DeploymentArtifacts,
  RuntimeCapabilities,
  AwsDiscoveredResources,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `API error (${response.status})`;
    try {
      const data = await response.json();
      if (data?.detail) {
        errorMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // Ignore JSON parse errors on non-JSON responses
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/dashboard/stats");
}

export async function fetchCpuMetrics(): Promise<ChartDataPoint[]> {
  return apiFetch<ChartDataPoint[]>("/dashboard/metrics/cpu");
}

export async function fetchMemoryMetrics(): Promise<ChartDataPoint[]> {
  return apiFetch<ChartDataPoint[]>("/dashboard/metrics/memory");
}

export async function fetchRecentActivity(): Promise<ActivityItem[]> {
  return apiFetch<ActivityItem[]>("/dashboard/activity");
}

// ─── Projects ───────────────────────────────────────────────────────────────

export async function fetchProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/projects");
}

export async function fetchProject(id: string): Promise<Project | undefined> {
  try {
    return await apiFetch<Project>(`/projects/${encodeURIComponent(id)}`);
  } catch {
    return undefined;
  }
}

export async function createProject(data: CreateProjectFormData): Promise<Project> {
  let zipUploadId: string | undefined;

  if (data.source === "zip" && data.zipFile) {
    const formData = new FormData();
    formData.append("file", data.zipFile);
    const uploadRes = await apiFetch<{ zipUploadId: string }>("/projects/upload-zip", {
      method: "POST",
      body: formData,
    });
    zipUploadId = uploadRes.zipUploadId;
  }

  return apiFetch<Project>("/projects", {
    method: "POST",
    body: JSON.stringify({
      source: data.source,
      repositoryUrl: data.repositoryUrl,
      branch: data.branch || "main",
      zipUploadId,
      name: data.name,
      description: data.description,
      framework: data.framework,
      buildCommand: data.buildCommand,
      startCommand: data.startCommand,
      rootDirectory: data.rootDirectory,
      cpu: data.cpu,
      memory: data.memory,
      replicas: data.replicas,
      envVars: data.envVars,
    }),
  });
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus
): Promise<Project | undefined> {
  return apiFetch<Project>(`/projects/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch<{ deleted: boolean }>(`/projects/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function triggerProjectDeploy(id: string): Promise<Deployment> {
  return apiFetch<Deployment>(`/projects/${encodeURIComponent(id)}/deploy`, {
    method: "POST",
  });
}

// ─── Deployments ────────────────────────────────────────────────────────────

export async function fetchDeployments(projectId?: string): Promise<Deployment[]> {
  const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  return apiFetch<Deployment[]>(`/deployments${qs}`);
}

export async function fetchDeployment(id: string): Promise<Deployment | undefined> {
  try {
    return await apiFetch<Deployment>(`/deployments/${encodeURIComponent(id)}`);
  } catch {
    return undefined;
  }
}

export async function fetchDeploymentArtifacts(id: string): Promise<DeploymentArtifacts> {
  return apiFetch<DeploymentArtifacts>(`/deployments/${encodeURIComponent(id)}/artifacts`);
}

export async function rollbackDeployment(deploymentId: string): Promise<Deployment> {
  return apiFetch<Deployment>(`/deployments/${encodeURIComponent(deploymentId)}/rollback`, {
    method: "POST",
  });
}

// ─── Infrastructure ─────────────────────────────────────────────────────────

export async function fetchRuntimeCapabilities(): Promise<RuntimeCapabilities> {
  return apiFetch<RuntimeCapabilities>("/infrastructure/runtime");
}

export async function fetchClusterHealth(): Promise<ClusterHealth> {
  return apiFetch<ClusterHealth>("/infrastructure/health");
}

export async function fetchNodes(): Promise<InfrastructureNode[]> {
  return apiFetch<InfrastructureNode[]>("/infrastructure/nodes");
}

export async function fetchPods(): Promise<K8sPod[]> {
  return apiFetch<K8sPod[]>("/infrastructure/pods");
}

export async function fetchServices(): Promise<K8sService[]> {
  return apiFetch<K8sService[]>("/infrastructure/services");
}

export async function fetchNamespaces(): Promise<K8sNamespace[]> {
  return apiFetch<K8sNamespace[]>("/infrastructure/namespaces");
}

// ─── AWS ────────────────────────────────────────────────────────────────────

export async function fetchAwsConnection(): Promise<AwsConnection> {
  return apiFetch<AwsConnection>("/aws/status");
}

export async function connectAws(credentials: {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  region: string;
}): Promise<AwsConnection> {
  return apiFetch<AwsConnection>("/aws/connect", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function testAwsConnection(): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>("/aws/test", {
    method: "POST",
  });
}

export async function fetchAwsResources(): Promise<AwsDiscoveredResources> {
  return apiFetch<AwsDiscoveredResources>("/aws/resources");
}

export async function uploadDeploymentToAwsS3(
  deploymentId: string,
  bucket: string
): Promise<{ bucket: string; prefix: string; uploadedCount: number; s3Uris: string[] }> {
  return apiFetch<{ bucket: string; prefix: string; uploadedCount: number; s3Uris: string[] }>(
    "/aws/upload-deployment",
    {
      method: "POST",
      body: JSON.stringify({ deploymentId, bucket }),
    }
  );
}

export async function disconnectAws(): Promise<void> {
  await apiFetch<{ status: string }>("/aws/disconnect", {
    method: "POST",
  });
}
