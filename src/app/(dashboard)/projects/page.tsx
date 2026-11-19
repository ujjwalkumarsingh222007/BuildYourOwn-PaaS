"use client"

import * as React from "react"
import Link from "next/link"
import { 
  FolderGit2, 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  ExternalLink, 
  GitBranch, 
  UploadCloud, 
  Cpu, 
  HardDrive, 
  RefreshCw,
  MoreVertical,
  Layers,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useProjects } from "@/hooks/use-projects"
import { StatusBadge } from "@/features/status/status-badge"
import { formatRelativeTime } from "@/lib/utils"

export default function ProjectsPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const { data: projects = [], isLoading } = useProjects()

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase()) ||
      project.framework.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your deployed microservices, web apps, and backend APIs.
          </p>
        </div>

        <Link href="/projects/new">
          <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-xs h-9 gap-1.5 shadow-md shadow-blue-500/20">
            <Plus className="h-4 w-4" /> Create New Project
          </Button>
        </Link>
      </div>

      {/* Filter and View Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name, framework, or desc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-background/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-xs bg-background/50">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="deploying">Deploying</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          {/* Grid vs List toggle */}
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-background">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/80 bg-card/60 p-6 space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mx-auto">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No projects found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No projects matched your criteria &quot;{search}&quot;. Try adjusting your filter or create a new project.
          </p>
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
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="group border-border/80 bg-card/60 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-background border border-border text-primary group-hover:scale-105 transition-transform">
                      {project.source === "github" ? (
                        <GitBranch className="h-4 w-4" />
                      ) : (
                        <UploadCloud className="h-4 w-4 text-violet-400" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-bold text-base text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        {project.name}
                      </Link>
                      <span className="text-[11px] font-mono text-muted-foreground uppercase">
                        {project.framework}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      project.status === "running"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : project.status === "deploying"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                        : project.status === "failed"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Live URL */}
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-mono truncate max-w-full"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{project.url.replace(/^https?:\/\//, "")}</span>
                  </a>
                ) : (
                  <div className="text-[11px] text-muted-foreground font-mono">
                    No active ingress endpoint
                  </div>
                )}

                {/* Specs Pill Bar */}
                <div className="flex items-center gap-3 pt-3 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-blue-400" /> {project.cpu}
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3 text-violet-400" /> {project.memory}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-emerald-400" /> {project.replicas} {project.replicas > 1 ? "pods" : "pod"}
                  </span>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
                  <span>Deployed {formatRelativeTime(project.lastDeployedAt)}</span>
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1 px-2">
                      Manage <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background border border-border text-primary">
                      {project.source === "github" ? (
                        <GitBranch className="h-4 w-4" />
                      ) : (
                        <UploadCloud className="h-4 w-4 text-violet-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-bold text-sm text-foreground hover:text-primary transition-colors"
                        >
                          {project.name}
                        </Link>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {project.framework}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center">
                    <div className="text-right hidden md:block font-mono text-[11px] text-muted-foreground">
                      <div>{project.cpu} / {project.memory}</div>
                      <div>{project.replicas} {project.replicas > 1 ? "replicas" : "replica"}</div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                        project.status === "running"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : project.status === "deploying"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                          : project.status === "failed"
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {project.status}
                    </span>

                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        Manage
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
