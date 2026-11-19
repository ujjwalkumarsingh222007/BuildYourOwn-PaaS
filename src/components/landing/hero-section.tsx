"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles,
  GitBranch,
  Layers,
  Cpu,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  const [copied, setCopied] = React.useState(false)

  const copyCommand = () => {
    navigator.clipboard.writeText("npx byo-paas deploy")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
      {/* Background radial gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-violet-600/20 to-cyan-500/10 blur-[130px] -z-10 rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-indigo-500/10 blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-400 mb-8 backdrop-blur-sm shadow-inner hover:border-blue-500/50 transition-colors">
          <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
          <span>Kubernetes K3s Orchestration Architecture</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-foreground font-mono">v1.0-beta</span>
        </div>

        {/* Hero headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
          From Code to Cloud.{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Without the Complexity.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Deploy your applications effortlessly with automated builds, Docker containers and Kubernetes orchestration.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/projects/new">
            <Button
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] hover:shadow-blue-600/35"
            >
              Start Deploying <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 rounded-xl border-border/80 hover:bg-accent font-medium hover:text-foreground"
            >
              Explore Platform
            </Button>
          </Link>
        </div>

        {/* Quick install snippet */}
        <div className="mt-8 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-card/70 border border-border text-xs font-mono text-muted-foreground shadow-sm backdrop-blur-sm">
            <Terminal className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-foreground font-medium">curl -sSL https://byo-paas.io/install.sh | bash</span>
            <button
              onClick={copyCommand}
              className="ml-2 hover:text-foreground transition-colors p-1 rounded"
              title="Copy command"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Terminal/Platform visual showcase */}
        <div className="mt-14 max-w-4xl mx-auto relative rounded-2xl border border-border/80 bg-slate-950/80 p-2 sm:p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          {/* Mac window header */}
          <div className="flex items-center justify-between pb-3 px-3 border-b border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-slate-400">byo-paas-deploy-engine // production</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Pipeline Active
              </span>
            </div>
          </div>

          {/* Interactive Pipeline Mockup */}
          <div className="p-4 sm:p-6 text-left space-y-4 font-mono text-xs sm:text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/90 border border-border/50">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <GitBranch className="h-3 w-3 text-blue-400" /> Source
                </div>
                <div className="text-foreground font-semibold text-xs truncate">git push main</div>
                <div className="text-[10px] text-emerald-400 mt-1">✓ Webhook Triggered</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-border/50">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-indigo-400" /> BuildKit
                </div>
                <div className="text-foreground font-semibold text-xs truncate">Multi-stage build</div>
                <div className="text-[10px] text-emerald-400 mt-1">✓ Cached layers</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-border/50">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Terminal className="h-3 w-3 text-violet-400" /> Registry
                </div>
                <div className="text-foreground font-semibold text-xs truncate">OCI Registry</div>
                <div className="text-[10px] text-emerald-400 mt-1">✓ Digest signed</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-border/50">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-cyan-400" /> K3s Cluster
                </div>
                <div className="text-foreground font-semibold text-xs truncate">Rollout 3/3 pods</div>
                <div className="text-[10px] text-emerald-400 mt-1">✓ Zero downtime</div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-lg bg-blue-950/40 border border-blue-500/40">
                <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-blue-400" /> Live Endpoint
                </div>
                <div className="text-blue-300 font-semibold text-xs truncate">app.byo-paas.dev</div>
                <div className="text-[10px] text-emerald-400 mt-1">✓ 200 OK (18ms)</div>
              </div>
            </div>

            {/* Mock log stream */}
            <div className="bg-slate-950 rounded-lg p-3.5 border border-border/40 space-y-1.5 text-[11px] sm:text-xs">
              <div className="text-slate-400">
                <span className="text-blue-400 font-bold">[11:02:14]</span> INF Initializing automated deployment pipeline for <span className="text-white font-medium">web-dashboard</span>...
              </div>
              <div className="text-slate-400">
                <span className="text-indigo-400 font-bold">[11:02:17]</span> INF BuildKit daemon building Docker image <span className="text-slate-200">registry.local/web-dashboard:v2.4.1</span>
              </div>
              <div className="text-slate-400">
                <span className="text-violet-400 font-bold">[11:02:22]</span> INF Pushing container layer to internal registry digest sha256:7b9c...
              </div>
              <div className="text-emerald-400">
                <span className="text-emerald-500 font-bold">[11:02:29]</span> OK Kubernetes deployment rollout finished successfully. Ingress TLS verified.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
