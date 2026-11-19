// ============================================================================
// PLATFORM CONFIGURATION PRESETS & EMPTY INITIAL STATES
// All random and dummy pre-populated datasets have been removed.
// Projects and deployments start empty and populate from user actions
// or from the FastAPI backend once connected.
// ============================================================================

import type {
  Project,
  Deployment,
  DeploymentStep,
  InfrastructureNode,
  K8sPod,
  K8sService,
  K8sNamespace,
  ClusterHealth,
  DashboardStats,
  ChartDataPoint,
  ActivityItem,
} from "@/types";

export const emptyDashboardStats: DashboardStats = {
  totalProjects: 0,
  runningApps: 0,
  failedDeployments: 0,
  totalDeployments: 0,
};

export const emptyCpuData: ChartDataPoint[] = [];
export const emptyMemoryData: ChartDataPoint[] = [];

export const initialProjects: Project[] = [];
export const initialDeployments: Deployment[] = [];
export const initialActivity: ActivityItem[] = [];

export const defaultDeploymentSteps: DeploymentStep[] = [
  {
    id: "step-1",
    name: "Source Code",
    status: "pending",
    description: "Fetch repository or extract uploaded ZIP archive",
  },
  {
    id: "step-2",
    name: "BuildKit",
    status: "pending",
    description: "Build OCI Docker image using BuildKit daemon",
  },
  {
    id: "step-3",
    name: "Container Registry",
    status: "pending",
    description: "Tag and push image to private container registry",
  },
  {
    id: "step-4",
    name: "K3s Deployment",
    status: "pending",
    description: "Apply Kubernetes manifests to K3s cluster",
  },
  {
    id: "step-5",
    name: "Health Check",
    status: "pending",
    description: "Verify readiness probe and expose Traefik ingress URL",
  },
];

export const emptyClusterHealth: ClusterHealth = {
  status: "disconnected",
  nodes: { ready: 0, total: 0 },
  pods: { running: 0, total: 0 },
  cpu: { used: 0, total: 0, unit: "cores" },
  memory: { used: 0, total: 0, unit: "GB" },
  uptime: "Not connected",
  k3sVersion: "Not connected",
};

export const initialNodes: InfrastructureNode[] = [];
export const initialPods: K8sPod[] = [];
export const initialServices: K8sService[] = [];
export const initialNamespaces: K8sNamespace[] = [];

export const frameworkOptions = [
  { value: "nextjs", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "express", label: "Express.js" },
  { value: "fastapi", label: "FastAPI" },
  { value: "django", label: "Django" },
  { value: "flask", label: "Flask" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "static", label: "Static Site" },
] as const;

export const cpuOptions = [
  { value: "250m", label: "0.25 CPU" },
  { value: "500m", label: "0.5 CPU" },
  { value: "1000m", label: "1 CPU" },
  { value: "2000m", label: "2 CPU" },
  { value: "4000m", label: "4 CPU" },
] as const;

export const memoryOptions = [
  { value: "256Mi", label: "256 MB" },
  { value: "512Mi", label: "512 MB" },
  { value: "1Gi", label: "1 GB" },
  { value: "2Gi", label: "2 GB" },
  { value: "4Gi", label: "4 GB" },
  { value: "8Gi", label: "8 GB" },
] as const;
