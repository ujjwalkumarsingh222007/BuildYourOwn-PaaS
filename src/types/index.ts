export type ProjectStatus = "running" | "stopped" | "deploying" | "failed" | "building";
export type DeploymentStatus = "pending" | "building" | "deploying" | "running" | "failed" | "rolled_back" | "stopped";
export type DeploymentSource = "github" | "zip";
export type Framework = "nextjs" | "react" | "vue" | "angular" | "express" | "fastapi" | "django" | "flask" | "go" | "rust" | "static";

export interface Project {
  id: string;
  name: string;
  description: string;
  framework: Framework;
  status: ProjectStatus;
  source: DeploymentSource;
  repositoryUrl?: string;
  branch?: string;
  lastDeployedAt: string;
  createdAt: string;
  url?: string;
  cpu: string;
  memory: string;
  replicas: number;
  envVars: EnvVar[];
  buildCommand: string;
  startCommand: string;
  rootDirectory: string;
}

export interface EnvVar {
  key: string;
  value: string;
  isSecret: boolean;
}

export interface Deployment {
  id: string;
  projectId: string;
  projectName: string;
  status: DeploymentStatus;
  source: DeploymentSource;
  commitHash?: string;
  commitMessage?: string;
  branch?: string;
  version: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  duration?: string;
  buildLogs: LogEntry[];
  runtimeLogs: LogEntry[];
  configuration: DeploymentConfiguration;
  artifacts?: DeploymentArtifacts;
}

export interface DeploymentArtifacts {
  imageTag?: string;
  workspacePath?: string;
  detectedFiles?: Record<string, boolean>;
  dockerfile?: string;
  deploymentYaml?: string;
  serviceYaml?: string;
  ingressYaml?: string;
  executedRealDocker?: boolean;
  executedRealKubectl?: boolean;
}

export interface RuntimeCapabilities {
  gitInstalled: boolean;
  dockerInstalled: boolean;
  kubectlInstalled: boolean;
  kubeconfigPresent: boolean;
  kubeconfigPath: string;
}

export interface AwsDiscoveredResources {
  connected: boolean;
  region?: string;
  vpcs: Array<{ id: string; cidr: string; isDefault: boolean }>;
  instances: Array<{ id: string; name: string; type: string; state: string; publicIp?: string }>;
  repositories: Array<{ name: string; uri: string }>;
  clusters: string[];
  buckets?: Array<{ name: string }>;
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface DeploymentConfiguration {
  framework: Framework;
  buildCommand: string;
  startCommand: string;
  rootDirectory: string;
  cpu: string;
  memory: string;
  replicas: number;
  envVars: EnvVar[];
}

export interface DeploymentStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  description: string;
}

export interface InfrastructureNode {
  id: string;
  name: string;
  status: "ready" | "not_ready" | "maintenance";
  role: "master" | "worker";
  cpu: { used: number; total: number };
  memory: { used: number; total: number };
  pods: number;
  maxPods: number;
  kubeletVersion: string;
  os: string;
  uptime: string;
}

export interface K8sPod {
  id: string;
  name: string;
  namespace: string;
  status: "Running" | "Pending" | "Succeeded" | "Failed" | "Unknown";
  restarts: number;
  cpu: string;
  memory: string;
  node: string;
  age: string;
  projectId?: string;
}

export interface K8sService {
  id: string;
  name: string;
  namespace: string;
  type: "ClusterIP" | "NodePort" | "LoadBalancer";
  clusterIp: string;
  externalIp?: string;
  ports: string;
  age: string;
}

export interface K8sNamespace {
  id: string;
  name: string;
  status: "Active" | "Terminating";
  pods: number;
  services: number;
  age: string;
}

export interface ClusterHealth {
  status: "healthy" | "degraded" | "unhealthy" | "disconnected";
  nodes: { ready: number; total: number };
  pods: { running: number; total: number };
  cpu: { used: number; total: number; unit: string };
  memory: { used: number; total: number; unit: string };
  uptime: string;
  k3sVersion: string;
}

export interface AwsConnection {
  status: "connected" | "disconnected" | "error" | "expired";
  accountId?: string;
  region?: string;
  iamUser?: string;
  connectedAt?: string;
  expiresAt?: string;
  services?: AwsServiceStatus[];
}

export interface AwsServiceStatus {
  name: string;
  status: "available" | "unavailable" | "limited";
  region: string;
}

export interface DashboardStats {
  totalProjects: number;
  runningApps: number;
  failedDeployments: number;
  totalDeployments: number;
}

export interface ChartDataPoint {
  time: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  type: "deployment" | "project" | "infrastructure" | "alert";
  message: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
}

export interface CreateProjectFormData {
  source: DeploymentSource;
  repositoryUrl?: string;
  branch?: string;
  zipFile?: File;
  name: string;
  description: string;
  framework: Framework;
  buildCommand: string;
  startCommand: string;
  rootDirectory: string;
  cpu: string;
  memory: string;
  replicas: number;
  envVars: EnvVar[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}
