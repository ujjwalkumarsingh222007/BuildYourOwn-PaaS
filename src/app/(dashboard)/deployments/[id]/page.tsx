"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { 
  ArrowLeft, 
  RotateCcw, 
  Terminal, 
  CheckCircle2, 
  GitBranch, 
  Copy,
  Check,
  Boxes,
  Layers,
  Loader2,
  XCircle,
  FileCode2,
  CloudUpload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { defaultDeploymentSteps } from "@/lib/mock-data"
import { useDeployment, useRollbackDeployment } from "@/hooks/use-deployments"
import { fetchAwsResources, uploadDeploymentToAwsS3 } from "@/services/api"
import { StatusBadge } from "@/features/status/status-badge"
import { formatDateTime } from "@/lib/utils"
import { toast } from "sonner"

export default function DeploymentDetailsPage() {
  const params = useParams()
  const deploymentId = params?.id as string

  const { data: deployment, isLoading } = useDeployment(deploymentId)
  const { data: awsResources } = useQuery({
    queryKey: ["aws-resources"],
    queryFn: fetchAwsResources,
  })
  const rollbackMutation = useRollbackDeployment()
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)
  const [selectedBucket, setSelectedBucket] = React.useState<string>("")
  const [uploadingToS3, setUploadingToS3] = React.useState(false)

  const handleUploadToS3 = async () => {
    if (!deployment || !selectedBucket) return
    setUploadingToS3(true)
    try {
      const res = await uploadDeploymentToAwsS3(deployment.id, selectedBucket)
      toast.success(`Uploaded ${res.uploadedCount} artifact(s) to AWS S3`, {
        description: `s3://${res.bucket}/${res.prefix}`,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload to AWS S3")
    } finally {
      setUploadingToS3(false)
    }
  }

  const handleRollback = async () => {
    if (!deployment) return
    toast.info(`Preparing rollback to build ${deployment.version}...`)
    try {
      await rollbackMutation.mutateAsync(deployment.id)
      toast.success(`Rollback completed for ${deployment.projectName} (${deployment.version})`)
    } catch {
      toast.error("Failed to rollback deployment")
    }
  }

  const copyText = (key: string, text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
    toast.success(`${label} copied to clipboard`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!deployment) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
        <Layers className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Deployment not found</h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No deployment with ID <span className="font-mono">{deploymentId}</span> was found.
        </p>
        <Link href="/deployments">
          <Button variant="outline" size="sm">
            Back to Deployments
          </Button>
        </Link>
      </div>
    )
  }

  const getStepStatus = (index: number) => {
    if (deployment.status === "running") return "completed"
    if (deployment.status === "failed") return index === 0 ? "completed" : "failed"
    if (deployment.status === "building") return index === 0 ? "completed" : index === 1 ? "running" : "pending"
    if (deployment.status === "deploying") return index <= 2 ? "completed" : index === 3 ? "running" : "pending"
    return "pending"
  }

  const artifacts = deployment.artifacts || {}
  const buildLogsText = deployment.buildLogs
    .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`)
    .join("\n")

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <Link
          href="/deployments"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to deployment history
        </Link>
      </div>

      {/* Header Info Banner */}
      <div className="p-6 rounded-2xl border border-border bg-card/80 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {deployment.projectName}
            </h1>
            <span className="font-mono text-sm font-bold text-primary px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
              {deployment.version}
            </span>
            <StatusBadge status={deployment.status} />
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            {deployment.commitMessage || "Direct deployment"}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground pt-1">
            {deployment.commitHash && (
              <span className="flex items-center gap-1">
                <GitBranch className="h-3 w-3 text-blue-400" />
                commit {deployment.commitHash}
              </span>
            )}
            <span>Started: {formatDateTime(deployment.createdAt)}</span>
            {deployment.duration && <span>Build duration: {deployment.duration}</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {awsResources?.connected && (awsResources.buckets?.length ?? 0) > 0 ? (
            <div className="flex items-center gap-1.5">
              <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                <SelectTrigger className="w-44 h-9 text-xs font-mono bg-background">
                  <SelectValue placeholder="Select S3 bucket" />
                </SelectTrigger>
                <SelectContent>
                  {awsResources.buckets?.map((b) => (
                    <SelectItem key={b.name} value={b.name} className="font-mono text-xs">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedBucket || uploadingToS3}
                onClick={handleUploadToS3}
                className="text-xs h-9 gap-1.5 font-semibold"
              >
                <CloudUpload className="h-3.5 w-3.5" />
                {uploadingToS3 ? "Uploading..." : "Push to S3"}
              </Button>
            </div>
          ) : (
            <Link href="/aws-connections">
              <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5">
                <CloudUpload className="h-3.5 w-3.5" /> Connect AWS to Upload
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRollback}
            className="text-xs h-9 gap-1.5 font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Rollback
          </Button>

          <Link href={`/projects/${deployment.projectId}`}>
            <Button size="sm" className="text-xs h-9 font-semibold">
              Project Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Deployment Pipeline Timeline Progress */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" />
            Deployment Pipeline Progress (Source Code → K3s Ingress)
          </CardTitle>
          <CardDescription className="text-xs">
            Live backend execution stages (polls automatically while building).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            {defaultDeploymentSteps.map((st, i) => {
              const status = getStepStatus(i)
              return (
                <div
                  key={st.id}
                  className="p-3.5 rounded-xl border border-border bg-background/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">
                        STAGE 0{i + 1}
                      </span>
                      {status === "completed" ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </span>
                      ) : status === "running" ? (
                        <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Running
                        </span>
                      ) : status === "failed" ? (
                        <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Failed
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold">Pending</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-xs text-foreground mb-1">{st.name}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {st.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Logs, Artifacts & Configuration Tabs */}
      <Tabs defaultValue="buildLogs" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-card border border-border flex-wrap h-auto">
            <TabsTrigger value="buildLogs">Build Logs ({deployment.buildLogs.length})</TabsTrigger>
            <TabsTrigger value="artifacts">Dockerfile &amp; K3s Manifests</TabsTrigger>
            <TabsTrigger value="runtimeLogs">Runtime Logs ({deployment.runtimeLogs.length})</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyText("logs", buildLogsText, "Build logs")}
            className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            {copiedKey === "logs" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            Copy Logs
          </Button>
        </div>

        {/* BUILD LOGS */}
        <TabsContent value="buildLogs">
          <Card className="border-border/80 bg-slate-950 text-slate-200 font-mono text-xs shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-900 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Terminal className="h-4 w-4 text-primary" />
                <span>pipeline-worker.log</span>
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {deployment.status === "building" || deployment.status === "deploying" ? "Streaming..." : "Complete"}
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-1.5 max-h-[460px] overflow-y-auto">
              {deployment.buildLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 hover:bg-slate-900/60 p-0.5 rounded">
                  <span className="text-slate-500 select-none text-[11px] w-20 shrink-0">
                    {log.timestamp.slice(11, 19)}
                  </span>
                  <span
                    className={`font-bold select-none text-[10px] w-12 shrink-0 uppercase ${
                      log.level === "error"
                        ? "text-red-400"
                        : log.level === "warn"
                        ? "text-amber-400"
                        : "text-blue-400"
                    }`}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCKERFILE & K3S MANIFESTS */}
        <TabsContent value="artifacts" className="space-y-4">
          {!artifacts.dockerfile ? (
            <Card className="border-border/80 bg-card/60 p-8 text-center text-xs text-muted-foreground">
              Artifacts are being generated or were not recorded for this deployment yet.
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { key: "dockerfile", title: "Dockerfile", content: artifacts.dockerfile },
                { key: "deploymentYaml", title: "k3s/deployment.yaml", content: artifacts.deploymentYaml },
                { key: "serviceYaml", title: "k3s/service.yaml", content: artifacts.serviceYaml },
                { key: "ingressYaml", title: "k3s/ingress.yaml", content: artifacts.ingressYaml },
              ].map((file) => (
                <Card key={file.key} className="border-border/80 bg-slate-950 text-slate-200">
                  <CardHeader className="py-3 px-4 border-b border-slate-900 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                      <FileCode2 className="h-4 w-4 text-primary" />
                      <span>{file.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-slate-400 hover:text-white gap-1"
                      onClick={() => copyText(file.key, file.content || "", file.title)}
                    >
                      {copiedKey === file.key ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      Copy
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4">
                    <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto max-h-72">
                      {file.content}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* RUNTIME LOGS */}
        <TabsContent value="runtimeLogs">
          <Card className="border-border/80 bg-slate-950 text-slate-200 font-mono text-xs shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-slate-900 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>k3s-pod-stdout.log</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-1.5 max-h-[460px] overflow-y-auto">
              {deployment.runtimeLogs.length === 0 ? (
                <div className="text-slate-500 py-8 text-center">
                  No runtime stdout recorded yet.
                </div>
              ) : (
                deployment.runtimeLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 hover:bg-slate-900/60 p-0.5 rounded">
                    <span className="text-slate-500 select-none text-[11px] w-20 shrink-0">
                      {log.timestamp.slice(11, 19)}
                    </span>
                    <span
                      className={`font-bold select-none text-[10px] w-12 shrink-0 uppercase ${
                        log.level === "error"
                          ? "text-red-400"
                          : log.level === "warn"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      [{log.level}]
                    </span>
                    <span className="text-slate-300 break-all">{log.message}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONFIGURATION */}
        <TabsContent value="config">
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Deployment Specification</CardTitle>
              <CardDescription className="text-xs">
                Parameters applied at build time for this deployment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-lg border border-border bg-background/50 space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px]">Framework</span>
                  <div className="text-foreground font-bold uppercase">{deployment.configuration.framework}</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-background/50 space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px]">vCPU Limit</span>
                  <div className="text-foreground font-bold">{deployment.configuration.cpu}</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-background/50 space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px]">Memory Threshold</span>
                  <div className="text-foreground font-bold">{deployment.configuration.memory}</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-background/50 space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px]">Pod Replicas</span>
                  <div className="text-foreground font-bold">{deployment.configuration.replicas} Replicas</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-background/50 space-y-1 sm:col-span-2">
                  <span className="text-muted-foreground uppercase text-[10px]">Build Command</span>
                  <div className="text-foreground">{deployment.configuration.buildCommand}</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-background/50 space-y-1 sm:col-span-2">
                  <span className="text-muted-foreground uppercase text-[10px]">Start Command</span>
                  <div className="text-foreground">{deployment.configuration.startCommand}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
