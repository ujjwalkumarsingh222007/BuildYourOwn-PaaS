"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  Server, 
  RefreshCw, 
  Info,
  Search,
  Layers,
  Network,
  Boxes,
  Cloud,
  CheckCircle2,
  XCircle,
  Cpu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  fetchClusterHealth,
  fetchNodes,
  fetchPods,
  fetchServices,
  fetchNamespaces,
  fetchRuntimeCapabilities,
  fetchAwsResources,
} from "@/services/api"
import { StatusBadge } from "@/features/status/status-badge"
import { toast } from "sonner"

export default function InfrastructurePage() {
  const queryClient = useQueryClient()
  const [podSearch, setPodSearch] = React.useState("")
  const [namespaceFilter, setNamespaceFilter] = React.useState("all")
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const { data: runtime } = useQuery({
    queryKey: ["host-runtime"],
    queryFn: fetchRuntimeCapabilities,
  })
  const { data: awsResources } = useQuery({
    queryKey: ["aws-resources"],
    queryFn: fetchAwsResources,
  })
  const { data: clusterHealth } = useQuery({
    queryKey: ["cluster-health"],
    queryFn: fetchClusterHealth,
  })
  const { data: nodes = [] } = useQuery({ queryKey: ["k8s-nodes"], queryFn: fetchNodes })
  const { data: pods = [] } = useQuery({ queryKey: ["k8s-pods"], queryFn: fetchPods })
  const { data: services = [] } = useQuery({ queryKey: ["k8s-services"], queryFn: fetchServices })
  const { data: namespaces = [] } = useQuery({ queryKey: ["k8s-namespaces"], queryFn: fetchNamespaces })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ["host-runtime"] })
    await queryClient.invalidateQueries({ queryKey: ["aws-resources"] })
    await queryClient.invalidateQueries({ queryKey: ["cluster-health"] })
    await queryClient.invalidateQueries({ queryKey: ["k8s-nodes"] })
    await queryClient.invalidateQueries({ queryKey: ["k8s-pods"] })
    setTimeout(() => {
      setIsRefreshing(false)
      toast.info(
        clusterHealth?.status === "disconnected"
          ? "Runtime & AWS checked. No K3s kubeconfig detected yet."
          : "Cluster state refreshed"
      )
    }, 300)
  }

  const filteredPods = pods.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(podSearch.toLowerCase()) ||
      p.node.toLowerCase().includes(podSearch.toLowerCase())
    const matchesNamespace =
      namespaceFilter === "all" || p.namespace === namespaceFilter
    return matchesSearch && matchesNamespace
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Infrastructure &amp; Runtime Overview
            </h1>
            <StatusBadge status={clusterHealth?.status || "disconnected"} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Host build capabilities, connected AWS resources, and Kubernetes K3s objects.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="text-xs h-9 gap-1.5"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Sync Runtime &amp; Cluster
        </Button>
      </div>

      {/* Host Runtime Capabilities */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            Host Build &amp; Orchestration Capabilities
          </CardTitle>
          <CardDescription className="text-xs">
            Live detection from the FastAPI control plane host.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            {[
              { label: "Git CLI", ok: runtime?.gitInstalled },
              { label: "Docker / BuildKit", ok: runtime?.dockerInstalled },
              { label: "kubectl CLI", ok: runtime?.kubectlInstalled },
              { label: "Kubeconfig File", ok: runtime?.kubeconfigPresent },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-xl border border-border bg-background/60 flex items-center justify-between"
              >
                <span className="text-foreground">{item.label}</span>
                {item.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {clusterHealth?.status === "disconnected" && (
        <Alert className="border-cyan-500/30 bg-cyan-500/10 text-foreground">
          <Info className="h-4 w-4 text-cyan-400 shrink-0" />
          <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">K3s Cluster Disconnected:</span> No <code className="font-mono text-foreground">kubeconfig</code> found at <code className="font-mono text-foreground">{runtime?.kubeconfigPath || "~/.kube/config"}</code>. Container Dockerfiles and K3s YAML manifests are still generated and saved by the deployment pipeline.
          </AlertDescription>
        </Alert>
      )}

      {/* Cluster Health High-Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Cluster Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={clusterHealth?.status || "disconnected"} />
            <p className="text-[11px] text-muted-foreground mt-2 font-mono">
              {clusterHealth?.k3sVersion || "Not connected"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Cluster Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-foreground">
              {clusterHealth?.nodes.ready ?? 0} / {clusterHealth?.nodes.total ?? 0} Ready
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {nodes.length ? "Active K3s nodes" : "No nodes registered"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">AWS VPCs / EC2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-foreground font-mono">
              {awsResources?.connected ? `${awsResources.vpcs.length} VPC / ${awsResources.instances.length} EC2` : "Not Linked"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {awsResources?.connected ? `Region: ${awsResources.region}` : "Connect AWS STS to inspect"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">AWS ECR / EKS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-foreground font-mono">
              {awsResources?.connected ? `${awsResources.repositories.length} ECR / ${awsResources.clusters.length} EKS` : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {awsResources?.connected ? "Live boto3 discovery" : "Awaiting AWS session"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Nodes, Pods, Services, Namespaces, AWS */}
      <Tabs defaultValue="nodes" className="space-y-6">
        <TabsList className="bg-card border border-border flex-wrap h-auto">
          <TabsTrigger value="nodes">K3s Nodes ({nodes.length})</TabsTrigger>
          <TabsTrigger value="pods">Pods ({pods.length})</TabsTrigger>
          <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
          <TabsTrigger value="namespaces">Namespaces ({namespaces.length})</TabsTrigger>
          <TabsTrigger value="aws">AWS Cloud ({awsResources?.connected ? "Connected" : "Offline"})</TabsTrigger>
        </TabsList>

        {/* NODES TAB */}
        <TabsContent value="nodes" className="space-y-4">
          {nodes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
              <Server className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-semibold text-foreground">No K3s Nodes Connected</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Attach a valid <code className="font-mono">KUBECONFIG</code> on the FastAPI backend host to inspect live K3s nodes, or connect your AWS account to discover existing EC2/EKS infrastructure.
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/aws-connections">
                  <Button size="sm" className="text-xs gap-1.5">
                    <Cloud className="h-3.5 w-3.5" /> Connect AWS Account
                  </Button>
                </Link>
                <Link href="/guide">
                  <Button variant="outline" size="sm" className="text-xs">
                    Read Setup Guide Book
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {nodes.map((node) => (
                <Card key={node.id} className="border-border/80 bg-card/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-foreground">{node.name}</span>
                      <StatusBadge status={node.status} />
                    </div>
                    <CardDescription className="text-xs font-mono">
                      Role: {node.role} • {node.os}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* PODS TAB */}
        <TabsContent value="pods" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter pods by name or node..."
                value={podSearch}
                onChange={(e) => setPodSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-background/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Namespace:</span>
              <div className="flex gap-1">
                {["all", "production", "kube-system"].map((ns) => (
                  <button
                    key={ns}
                    onClick={() => setNamespaceFilter(ns)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                      namespaceFilter === ns
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ns}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredPods.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
              <Boxes className="h-9 w-9 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">No Pods Scheduled</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No live Kubernetes pods are available until a K3s control plane is connected.
              </p>
            </div>
          ) : null}
        </TabsContent>

        {/* SERVICES TAB */}
        <TabsContent value="services" className="space-y-4">
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
            <Network className="h-9 w-9 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">No Cluster Services</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              ClusterIP, LoadBalancer, and Traefik Ingress services will appear once a K3s cluster is linked.
            </p>
          </div>
        </TabsContent>

        {/* NAMESPACES TAB */}
        <TabsContent value="namespaces" className="space-y-4">
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
            <Layers className="h-9 w-9 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">No Namespaces Listed</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Connect your K3s API endpoint to inspect active Kubernetes namespaces.
            </p>
          </div>
        </TabsContent>

        {/* AWS RESOURCES TAB */}
        <TabsContent value="aws" className="space-y-4">
          {!awsResources?.connected ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
              <Cloud className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-semibold text-foreground">AWS Session Not Connected</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Connect your AWS account using temporary STS credentials in{" "}
                <Link href="/aws-connections" className="text-primary hover:underline">
                  /aws-connections
                </Link>{" "}
                to discover your VPCs, EC2 instances, ECR repositories, and EKS clusters live.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <Card className="border-border/80 bg-card/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold font-sans">VPCs ({awsResources.vpcs.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {awsResources.vpcs.map((v) => (
                    <div key={v.id} className="p-2.5 rounded bg-background/60 border border-border flex justify-between">
                      <span>{v.id}</span>
                      <span className="text-muted-foreground">{v.cidr}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-card/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold font-sans">EC2 Instances ({awsResources.instances.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {awsResources.instances.length === 0 ? (
                    <p className="text-muted-foreground">No EC2 instances found in {awsResources.region}.</p>
                  ) : (
                    awsResources.instances.map((i) => (
                      <div key={i.id} className="p-2.5 rounded bg-background/60 border border-border flex justify-between">
                        <span>{i.name} ({i.type})</span>
                        <Badge variant="outline" className="text-[10px]">{i.state}</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-card/60 md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold font-sans">S3 Buckets ({awsResources.buckets?.length ?? 0})</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(awsResources.buckets?.length ?? 0) === 0 ? (
                    <p className="text-muted-foreground">No S3 buckets found.</p>
                  ) : (
                    awsResources.buckets?.map((b) => (
                      <div key={b.name} className="p-2.5 rounded bg-background/60 border border-border truncate">
                        s3://{b.name}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
