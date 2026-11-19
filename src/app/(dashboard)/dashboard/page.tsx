"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  FolderGit2, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  ArrowUpRight, 
  Plus, 
  RefreshCw,
  GitBranch,
  UploadCloud,
  Server,
  Activity,
  BarChart3
} from "lucide-react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  fetchDashboardStats,
  fetchCpuMetrics,
  fetchMemoryMetrics,
  fetchRecentActivity,
  fetchClusterHealth,
} from "@/services/api"
import { useDeployments } from "@/hooks/use-deployments"
import { StatusBadge } from "@/features/status/status-badge"
import { formatRelativeTime } from "@/lib/utils"

export default function DashboardOverviewPage() {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = React.useState(false)

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  })

  const { data: cpuMetrics = [] } = useQuery({
    queryKey: ["cpu-metrics"],
    queryFn: fetchCpuMetrics,
  })

  const { data: memoryMetrics = [] } = useQuery({
    queryKey: ["memory-metrics"],
    queryFn: fetchMemoryMetrics,
  })

  const { data: recentActivity = [] } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: fetchRecentActivity,
  })

  const { data: clusterHealth } = useQuery({
    queryKey: ["cluster-health"],
    queryFn: fetchClusterHealth,
  })

  const { data: deployments = [] } = useDeployments()

  const handleRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries()
    setTimeout(() => {
      setRefreshing(false)
    }, 300)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Platform Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your projects, deployment pipelines, and cluster connections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="text-xs h-9 gap-1.5"
            disabled={refreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/projects/new">
            <Button
              size="sm"
              className="h-9 text-xs bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" /> Quick Deployment
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 bg-card/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Projects
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats?.totalProjects ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalProjects ? "Active in local session" : "No projects created yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Running Applications
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats?.runningApps ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.runningApps ? "Simulated active apps" : "No running applications"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Failed Deployments
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats?.failedDeployments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              No build failures recorded
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              Total Deployments
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {stats?.totalDeployments ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalDeployments ? "Pipeline executions in session" : "Waiting for first deployment"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Telemetry Charts (CPU & Memory) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Chart */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-400" />
                Cluster CPU Utilization
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Live telemetry from connected K3s metrics server
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
              {cpuMetrics.length > 0 ? "Live" : "No Stream"}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            {cpuMetrics.length === 0 ? (
              <div className="h-56 w-full rounded-xl border border-dashed border-border bg-background/40 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <BarChart3 className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-xs font-semibold text-foreground">No CPU Telemetry Available</p>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  Connect the FastAPI backend and K3s cluster to stream real node and pod CPU metrics.
                </p>
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Memory Chart */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-violet-400" />
                Cluster Memory Allocation
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Container cgroup memory utilization across cluster nodes
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
              {memoryMetrics.length > 0 ? "Live" : "No Stream"}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            {memoryMetrics.length === 0 ? (
              <div className="h-56 w-full rounded-xl border border-dashed border-border bg-background/40 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <HardDrive className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-xs font-semibold text-foreground">No Memory Telemetry Available</p>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  Connect the FastAPI backend and K3s metrics server to observe memory headroom.
                </p>
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={memoryMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Split section: Recent Deployments & Infrastructure / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Deployments (2 Cols) */}
        <Card className="lg:col-span-2 border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Recent Deployments</CardTitle>
              <CardDescription className="text-xs">
                Projects and builds triggered in this session
              </CardDescription>
            </div>
            <Link href="/deployments">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {deployments.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border bg-background/40 space-y-3">
                <Layers className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                <h4 className="text-sm font-semibold text-foreground">No deployments yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Start your first project using the 5-step GitHub or ZIP deployment wizard.
                </p>
                <Link href="/projects/new" className="inline-block pt-1">
                  <Button size="sm" className="text-xs gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Deploy First App
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {deployments.slice(0, 4).map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3.5 rounded-xl border border-border bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-card border border-border text-muted-foreground mt-0.5">
                        {dep.source === "github" ? (
                          <GitBranch className="h-4 w-4 text-blue-400" />
                        ) : (
                          <UploadCloud className="h-4 w-4 text-violet-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/deployments/${dep.id}`}
                            className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
                          >
                            {dep.projectName}
                          </Link>
                          <span className="text-xs font-mono text-muted-foreground">
                            {dep.version}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">
                          {dep.commitMessage || "Direct ZIP archive upload"}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1 font-mono">
                          <span>{formatRelativeTime(dep.createdAt)}</span>
                          {dep.duration && <span>Duration: {dep.duration}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <StatusBadge status={dep.status} />
                      <Link href={`/deployments/${dep.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Infrastructure Status & Activity (1 Col) */}
        <div className="space-y-6">
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Server className="h-4 w-4 text-cyan-400" />
                  Cluster Health
                </CardTitle>
                <StatusBadge status={clusterHealth?.status || "disconnected"} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">K3s Version</span>
                <span className="font-mono text-foreground">{clusterHealth?.k3sVersion || "Not connected"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Nodes Status</span>
                <span className="font-mono text-foreground">
                  {clusterHealth ? `${clusterHealth.nodes.ready} / ${clusterHealth.nodes.total} Ready` : "0 / 0 Ready"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Active Pods</span>
                <span className="font-mono text-foreground">{clusterHealth?.pods.running ?? 0} Pods</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-mono text-foreground">{clusterHealth?.uptime || "Not connected"}</span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link href="/infrastructure">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Inspect Cluster Topology
                  </Button>
                </Link>
                <Link href="/aws-connections">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-primary">
                    Connect AWS Account →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stream */}
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No activity recorded in this session yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.slice(0, 4).map((act) => (
                    <div key={act.id} className="text-xs flex items-start gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          act.status === "success"
                            ? "bg-emerald-400"
                            : act.status === "error"
                            ? "bg-destructive"
                            : act.status === "warning"
                            ? "bg-amber-400"
                            : "bg-blue-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-foreground leading-snug">{act.message}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatRelativeTime(act.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
