import * as React from "react"
import Link from "next/link"
import { GitBranch, GitPullRequest, CheckCircle2, ArrowRight, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GithubDeploySection() {
  return (
    <section className="py-20 md:py-28 bg-slate-900/20 border-t border-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <Zap className="h-3 w-3" /> Seamless Git Integration
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Connect GitHub. Push Code. We Handle The Rest.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Link your public or private repositories with one click. Every commit to your target branch is automatically built with BuildKit and released with zero disruption to active traffic.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Automatic branch and commit tracking with SHA traceability",
                "Instant rollback to any prior successful deployment build",
                "Automated framework detection (Next.js, FastAPI, Go, Express)",
                "Full build logs streaming and status notifications",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link href="/projects/new">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  Deploy GitHub Repository <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <span className="font-mono font-medium text-foreground">acme-corp / api-gateway</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected
              </span>
            </div>

            <div className="py-4 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-background border border-border flex items-center justify-between">
                <div>
                  <div className="text-foreground font-semibold flex items-center gap-2">
                    <GitPullRequest className="h-3.5 w-3.5 text-blue-400" />
                    <span>fix: resolve rate limiting edge case</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    commit e4f5g6h • branch main • 2 hours ago
                  </div>
                </div>
                <span className="text-emerald-400 text-xs font-semibold">Deployed</span>
              </div>

              <div className="p-3 rounded-lg bg-background/60 border border-border/60 flex items-center justify-between">
                <div>
                  <div className="text-foreground/80 font-medium">feat: update telemetry collectors</div>
                  <div className="text-[11px] text-muted-foreground mt-1">commit a9c1d2e • branch main • yesterday</div>
                </div>
                <span className="text-muted-foreground text-xs">Superceded</span>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span>Webhook listening on refs/heads/main</span>
                </div>
                <span className="text-[11px] font-semibold">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
