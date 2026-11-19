"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  Cpu, 
  HardDrive, 
  RefreshCw, 
  Wifi,
  Clock
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useProjects } from "@/hooks/use-projects"
import { fetchCpuMetrics, fetchMemoryMetrics } from "@/services/api"
import { toast } from "sonner"

export default function MonitoringPage() {
  const queryClient = useQueryClient()
  const { data: projects = [] } = useProjects()
  const [selectedProject, setSelectedProject] = React.useState("all")
  const [refreshing, setRefreshing] = React.useState(false)

  const { data: cpuMetrics = [] } = useQuery({
    queryKey: ["cpu-metrics"],
    queryFn: fetchCpuMetrics,
    refetchInterval: 5000,
  })

  const { data: memoryMetrics = [] } = useQuery({
    queryKey: ["memory-metrics"],
    queryFn: fetchMemoryMetrics,
    refetchInterval: 5000,
  })

  const latestCpu = cpuMetrics.length > 0 ? cpuMetrics[cpuMetrics.length - 1].value : null
  const latestMem = memoryMetrics.length > 0 ? memoryMetrics[memoryMetrics.length - 1].value : null

  const handleRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ["cpu-metrics"] })
    await queryClient.invalidateQueries({ queryKey: ["memory-metrics"] })
    setTimeout(() => {
      setRefreshing(false)
      toast.success("Telemetry refreshed")
    }, 300)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              System &amp; App Monitoring
            </h1>
            <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400">
              LIVE HOST
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time CPU and memory utilization sampled from the backend host.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-44 h-9 text-xs bg-card">
              <SelectValue placeholder="All Applications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="h-9 w-9"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-blue-400" /> Host CPU Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {latestCpu !== null ? `${latestCpu}%` : "—%"}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1">5s polling</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <HardDrive className="h-3.5 w-3.5 text-violet-400" /> Host Memory Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {latestMem !== null ? `${latestMem}%` : "—%"}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1">5s polling</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Wifi className="h-3.5 w-3.5 text-cyan-400" /> Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">{projects.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Tracked in backend</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-emerald-400" /> Samples Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">{cpuMetrics.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Rolling 24-point buffer</p>
          </CardContent>
        </Card>
      </div>

      {/* Live CPU & Memory Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-400" /> Host CPU Load (%)
            </CardTitle>
            <CardDescription className="text-xs">Real-time CPU telemetry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="liveCpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#liveCpuGrad)" name="CPU %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-violet-400" /> Host Memory Allocation (%)
            </CardTitle>
            <CardDescription className="text-xs">Real-time RAM telemetry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memoryMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="liveMemGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#liveMemGrad)" name="Memory %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
