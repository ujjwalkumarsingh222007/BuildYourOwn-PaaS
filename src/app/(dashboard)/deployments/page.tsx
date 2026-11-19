"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Layers, 
  GitBranch, 
  UploadCloud, 
  Search, 
  ArrowUpRight, 
  Clock, 
  RotateCcw,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useDeployments, useRollbackDeployment } from "@/hooks/use-deployments"
import { StatusBadge } from "@/features/status/status-badge"
import { formatRelativeTime } from "@/lib/utils"
import type { Deployment } from "@/types"
import { toast } from "sonner"

export default function DeploymentsPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const { data: deployments = [], isLoading } = useDeployments()
  const rollbackMutation = useRollbackDeployment()

  const filteredDeployments = deployments.filter((d) => {
    const matchesSearch =
      d.projectName.toLowerCase().includes(search.toLowerCase()) ||
      d.version.toLowerCase().includes(search.toLowerCase()) ||
      (d.commitMessage && d.commitMessage.toLowerCase().includes(search.toLowerCase()))

    const matchesStatus =
      statusFilter === "all" || d.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleRollback = async (dep: Deployment) => {
    toast.info(`Initiating simulated rollback to ${dep.version}...`)
    try {
      await rollbackMutation.mutateAsync(dep.id)
      toast.success(`Simulated rollback completed for ${dep.projectName} ${dep.version}`)
    } catch {
      toast.error("Failed to rollback deployment")
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Deployments History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit trail of container builds, source versions, and simulated rollouts.
          </p>
        </div>

        <Link href="/projects/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 gap-1.5">
            <Plus className="h-4 w-4" /> New Deployment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project, version, source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/50"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9 text-xs bg-background/50">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="building">Building</SelectItem>
            <SelectItem value="stopped">Stopped</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deployment List / Loading / Empty State */}
      {isLoading ? (
        <Card className="border-border/80 bg-card/60 p-6 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      ) : filteredDeployments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mx-auto">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No deployments found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {deployments.length === 0
              ? "No deployments have been executed yet. Create a project to run your first deployment pipeline."
              : "No deployments matched your current search or filter."}
          </p>
          {deployments.length === 0 ? (
            <Link href="/projects/new">
              <Button size="sm" className="text-xs gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Start First Deployment
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("")
                setStatusFilter("all")
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredDeployments.map((dep) => (
                <div
                  key={dep.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-background border border-border mt-0.5 text-muted-foreground">
                      {dep.source === "github" ? (
                        <GitBranch className="h-4 w-4 text-blue-400" />
                      ) : (
                        <UploadCloud className="h-4 w-4 text-violet-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/deployments/${dep.id}`}
                          className="font-bold text-sm text-foreground hover:text-primary transition-colors"
                        >
                          {dep.projectName}
                        </Link>
                        <span className="font-mono text-xs text-muted-foreground font-semibold">
                          {dep.version}
                        </span>
                        {dep.commitHash && (
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {dep.commitHash}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 max-w-xl truncate">
                        {dep.commitMessage || "Direct source deployment"}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(dep.createdAt)}
                        </span>
                        {dep.duration && <span>Build: {dep.duration}</span>}
                        <span>Framework: {dep.configuration.framework}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <StatusBadge status={dep.status} />

                    {dep.status !== "running" && dep.status !== "building" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRollback(dep)}
                        className="text-xs h-8 gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Rollback
                      </Button>
                    )}

                    <Link href={`/deployments/${dep.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs h-8 gap-1 text-primary">
                        Logs <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
