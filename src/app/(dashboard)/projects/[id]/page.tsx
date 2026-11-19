"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { 
  ArrowLeft, 
  ExternalLink, 
  GitBranch, 
  Cpu, 
  HardDrive, 
  Layers, 
  Play, 
  RotateCcw, 
  Square, 
  Trash2, 
  Lock, 
  Eye, 
  EyeOff, 
  Clock,
  ArrowUpRight,
  FolderGit2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useProject, useDeleteProject } from "@/hooks/use-projects"
import { useDeployments } from "@/hooks/use-deployments"
import { updateProjectStatus, triggerProjectDeploy } from "@/services/api"
import { StatusBadge } from "@/features/status/status-badge"
import { formatRelativeTime } from "@/lib/utils"
import { toast } from "sonner"
import type { ProjectStatus } from "@/types"

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const projectId = params?.id as string

  const { data: project, isLoading } = useProject(projectId)
  const { data: projectDeployments = [] } = useDeployments(projectId)
  const deleteProjectMutation = useDeleteProject()
  const [revealedSecrets, setRevealedSecrets] = React.useState<Record<number, boolean>>({})

  const handleAction = async (actionName: string, newStatus?: ProjectStatus) => {
    if (!project) return
    toast.info(`Executing ${actionName}...`)
    if (newStatus) {
      await updateProjectStatus(project.id, newStatus)
      await queryClient.invalidateQueries({ queryKey: ["projects"] })
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    }
    toast.success(`${actionName} completed`)
  }

  const handleRedeploy = async () => {
    if (!project) return
    toast.info(`Queueing new deployment for ${project.name}...`)
    try {
      const dep = await triggerProjectDeploy(project.id)
      await queryClient.invalidateQueries({ queryKey: ["deployments"] })
      await queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success(`Started deployment ${dep.version}`)
      router.push(`/deployments/${dep.id}`)
    } catch {
      toast.error("Failed to trigger deployment")
    }
  }

  const handleDelete = async () => {
    if (!project) return
    if (confirm(`Are you sure you want to delete project ${project.name}?`)) {
      await deleteProjectMutation.mutateAsync(project.id)
      toast.success(`Project ${project.name} deleted`)
      router.push("/projects")
    }
  }

  const toggleReveal = (index: number) => {
    setRevealedSecrets((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
        <FolderGit2 className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Project not found</h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No project with ID <span className="font-mono">{projectId}</span> exists in this session.
        </p>
        <Link href="/projects">
          <Button variant="outline" size="sm">
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to projects
        </Link>
      </div>

      {/* Project Header Card */}
      <div className="p-6 rounded-2xl border border-border bg-card/80 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {project.name}
            </h1>
            <Badge variant="outline" className="font-mono text-xs uppercase">
              {project.framework}
            </Badge>
            <StatusBadge status={project.status} />
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground pt-1">
            {project.url && (
              <span className="inline-flex items-center gap-1 text-primary">
                <ExternalLink className="h-3 w-3" />
                {project.url} (simulated)
              </span>
            )}
            {project.source === "github" && project.repositoryUrl && (
              <span className="flex items-center gap-1">
                <GitBranch className="h-3 w-3 text-blue-400" />
                {project.repositoryUrl.replace("https://github.com/", "")} ({project.branch || "main"})
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Created {formatRelativeTime(project.lastDeployedAt)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={handleRedeploy}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 gap-1.5"
          >
            <Play className="h-3.5 w-3.5" /> Redeploy
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("Rolling Restart")}
            className="text-xs h-9 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restart
          </Button>

          {project.status === "running" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("Stop Application", "stopped")}
              className="text-xs h-9 gap-1.5 text-amber-400 hover:text-amber-300"
            >
              <Square className="h-3.5 w-3.5" /> Stop
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("Start Application", "running")}
              className="text-xs h-9 gap-1.5 text-emerald-400"
            >
              <Play className="h-3.5 w-3.5" /> Start
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-9 w-9 text-destructive hover:bg-destructive/10"
            title="Delete project"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments ({projectDeployments.length})</TabsTrigger>
          <TabsTrigger value="env">Environment Variables ({project.envVars.length})</TabsTrigger>
          <TabsTrigger value="resources">Configured Resources</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border/80 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-blue-400" /> CPU Limits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{project.cpu}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Target cgroup quota</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <HardDrive className="h-3.5 w-3.5 text-violet-400" /> Memory Threshold
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{project.memory}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Target memory limit</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-emerald-400" /> Target Replicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{project.replicas} Replicas</div>
                <p className="text-[11px] text-muted-foreground mt-1">Desired pod count</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/80 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Build & Execution Specs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-background/60 border border-border space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase">Build Command</div>
                  <div className="text-foreground">{project.buildCommand}</div>
                </div>
                <div className="p-3 rounded-lg bg-background/60 border border-border space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase">Start Command</div>
                  <div className="text-foreground">{project.startCommand}</div>
                </div>
                <div className="p-3 rounded-lg bg-background/60 border border-border space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase">Root Directory</div>
                  <div className="text-foreground">{project.rootDirectory}</div>
                </div>
                <div className="p-3 rounded-lg bg-background/60 border border-border space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase">Deployment Source</div>
                  <div className="text-foreground">{project.source === "github" ? "GitHub" : "ZIP Archive"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEPLOYMENTS TAB */}
        <TabsContent value="deployments" className="space-y-4">
          {projectDeployments.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
              No deployments recorded for this project yet.
            </div>
          ) : (
            <div className="space-y-3">
              {projectDeployments.map((dep) => (
                <div
                  key={dep.id}
                  className="p-4 rounded-xl border border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">{dep.version}</span>
                      <StatusBadge status={dep.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dep.commitMessage || "Direct source deployment"}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground mt-1">
                      <span>{formatRelativeTime(dep.createdAt)}</span>
                      {dep.duration && <span>Build duration: {dep.duration}</span>}
                    </div>
                  </div>

                  <Link href={`/deployments/${dep.id}`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      View Build Logs <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ENVIRONMENT VARIABLES TAB */}
        <TabsContent value="env" className="space-y-4">
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Configured Environment Variables</CardTitle>
              <CardDescription className="text-xs">
                Variables saved in project configuration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.envVars.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-6">
                  No custom environment variables defined for this project.
                </div>
              ) : (
                <div className="divide-y divide-border rounded-xl border border-border bg-background/50">
                  {project.envVars.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-2.5 truncate">
                        {item.isSecret && <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                        <span className="font-bold text-foreground">{item.key}</span>
                        <span className="text-muted-foreground">=</span>
                        <span className="text-muted-foreground truncate">
                          {item.isSecret && !revealedSecrets[idx] ? "••••••••••••••••" : item.value}
                        </span>
                      </div>
                      {item.isSecret && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => toggleReveal(idx)}
                        >
                          {revealedSecrets[idx] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESOURCES TAB */}
        <TabsContent value="resources" className="space-y-4">
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Desired Kubernetes Replica Spec</CardTitle>
              <CardDescription className="text-xs">
                Configured pod template specification (actual K3s pods will schedule once backend cluster is connected).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl border border-dashed border-border bg-background/40 text-xs text-muted-foreground space-y-2">
                <div className="font-mono text-foreground font-semibold">
                  Desired Replicas: {project.replicas} × ({project.cpu} CPU, {project.memory} RAM)
                </div>
                <p>
                  No live K3s cluster is connected yet. Connect your FastAPI backend & Kubernetes cluster to view scheduled pod names and node placement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
