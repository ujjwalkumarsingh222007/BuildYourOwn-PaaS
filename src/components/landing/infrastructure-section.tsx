import * as React from "react"
import Link from "next/link"
import { Server, Cpu, Database, Network, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InfrastructureSection() {
  const stats = [
    { label: "Cluster Nodes", value: "3 Ready", desc: "1 Master / 2 Workers" },
    { label: "Active Pods", value: "18 Running", desc: "Across 4 Namespaces" },
    { label: "Memory Assigned", value: "14.8 GB / 32 GB", desc: "46% allocation" },
    { label: "Engine", value: "K3s v1.31.4", desc: "Lightweight Certified K8s" },
  ]

  return (
    <section id="infrastructure" className="py-20 md:py-28 bg-slate-900/30 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            Under The Hood
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Kubernetes-Powered Infrastructure
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            We use K3s — the CNCF-certified lightweight Kubernetes distribution. Get production orchestration without the 10x overhead of traditional clusters.
          </p>
        </div>

        {/* Cluster Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="p-5 rounded-xl border border-border bg-card/60">
              <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
              <div className="text-2xl font-bold text-foreground mt-1 tracking-tight">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Visual Architecture Representation */}
        <div className="rounded-2xl border border-border bg-card/80 p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Server className="h-5 w-5 text-cyan-400" />
                Simulated Production Cluster Topology
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Isolated user namespaces, resource limits (cgroups), Traefik ingress, and internal DNS resolution.
              </p>
            </div>
            <Link href="/infrastructure">
              <Button variant="outline" size="sm" className="font-medium">
                View Infrastructure Console <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl border border-border bg-background/60">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-semibold text-foreground">k3s-master-01</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Control Plane</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Role:</span> <span className="text-foreground">Master (etcd/sqlite)</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>CPU:</span> <span className="text-foreground">1.8 / 4 Cores</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Memory:</span> <span className="text-foreground">6.2 / 16 GB</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Managed Pods:</span> <span className="text-foreground">8 System Pods</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background/60">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-semibold text-foreground">k3s-worker-01</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Worker Node</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Role:</span> <span className="text-foreground">Application Workloads</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>CPU:</span> <span className="text-foreground">1.2 / 4 Cores</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Memory:</span> <span className="text-foreground">4.8 / 8 GB</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Active Pods:</span> <span className="text-foreground">6 App Pods</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background/60">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-semibold text-foreground">k3s-worker-02</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Worker Node</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Role:</span> <span className="text-foreground">Application Workloads</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>CPU:</span> <span className="text-foreground">1.2 / 4 Cores</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Memory:</span> <span className="text-foreground">3.8 / 8 GB</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Active Pods:</span> <span className="text-foreground">4 App Pods</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
