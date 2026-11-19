import * as React from "react"
import { 
  GitBranch, 
  Layers, 
  Box, 
  HardDrive, 
  Server, 
  Globe, 
  ArrowRight,
  Shield,
  Check
} from "lucide-react"

export function ArchitectureOverviewSection() {
  const pipeline = [
    {
      title: "1. Source Code",
      subtitle: "GitHub Repo / ZIP archive",
      detail: "Triggered via webhook or direct bundle upload. Analyzed for dependencies.",
      icon: GitBranch,
      color: "border-blue-500/50 bg-blue-500/5 text-blue-400",
    },
    {
      title: "2. BuildKit Daemon",
      subtitle: "Container image builder",
      detail: "Automated multi-stage builder executes build command and isolates compile steps.",
      icon: Layers,
      color: "border-indigo-500/50 bg-indigo-500/5 text-indigo-400",
    },
    {
      title: "3. Docker Image",
      subtitle: "Lightweight OCI artefact",
      detail: "Optimized minimal layer container tagged with Git SHA or semver version.",
      icon: Box,
      color: "border-violet-500/50 bg-violet-500/5 text-violet-400",
    },
    {
      title: "4. Container Registry",
      subtitle: "Secure internal registry",
      detail: "Vulnerability-scanned and ready for instant distribution to K3s cluster nodes.",
      icon: HardDrive,
      color: "border-purple-500/50 bg-purple-500/5 text-purple-400",
    },
    {
      title: "5. Kubernetes K3s",
      subtitle: "Cluster orchestration",
      detail: "Rolling deployment, health liveness probes, replica set management, and namespaces.",
      icon: Server,
      color: "border-pink-500/50 bg-pink-500/5 text-pink-400",
    },
    {
      title: "6. Live App URL",
      subtitle: "Traefik Ingress + TLS",
      detail: "Automated reverse proxy routing with automatic Let's Encrypt SSL and DDoS protection.",
      icon: Globe,
      color: "border-emerald-500/50 bg-emerald-500/5 text-emerald-400",
    },
  ]

  return (
    <section id="architecture" className="py-20 md:py-28 bg-slate-900/30 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4">
            System Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            The Complete Deployment Lifecycle
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            A standardized, predictable flow from source code to edge distribution. Designed for high developer velocity without sacrificing production-grade infrastructure standards.
          </p>
        </div>

        {/* Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipeline.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className={`relative rounded-2xl border p-6 backdrop-blur-sm ${item.color} transition-all hover:scale-[1.02] shadow-sm`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-background/80 border border-border shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    STEP 0{idx + 1}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground mb-1">
                  {item.title}
                </h3>
                <div className="text-xs font-semibold text-muted-foreground mb-3 font-mono">
                  {item.subtitle}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.detail}
                </p>
              </div>
            )
          })}
        </div>

        {/* Technical guarantees banner */}
        <div className="mt-12 p-6 rounded-2xl border border-border bg-card/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">Zero-Downtime Rollouts & Automated Health Probes</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                New pods must pass HTTP readiness probes before old pods are decommissioned.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Rolling Updates</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Auto-rollback on failure</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> K3s Ingress</span>
          </div>
        </div>
      </div>
    </section>
  )
}
