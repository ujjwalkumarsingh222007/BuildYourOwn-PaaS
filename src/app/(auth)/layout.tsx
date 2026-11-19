import * as React from "react"
import Link from "next/link"
import { Rocket, ArrowLeft, Shield } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background selection:bg-primary/20 selection:text-primary">
      {/* Left panel: Auth Form */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to website
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto py-8">
          {children}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Protected by enterprise-grade TLS. BuildYourOwn PaaS Cloud.
        </div>
      </div>

      {/* Right panel: Showcase / Brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-950 border-l border-border/40 relative overflow-hidden text-white">
        <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-violet-600/20 to-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20">
            <Rocket className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            BuildYourOwn <span className="text-blue-400">PaaS</span>
          </span>
        </div>

        <div className="space-y-6 max-w-lg z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" /> Cloud Platform Infrastructure
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Deploy in seconds. Scale to thousands of containers.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Automated multi-stage BuildKit builds, internal registry caching, and K3s Kubernetes orchestration built directly for modern developers.
          </p>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 font-mono text-xs space-y-1.5 text-slate-300">
            <div className="text-slate-500">{"// Pipeline configuration"}</div>
            <div className="text-blue-400">$ byo-paas deploy --source ./src</div>
            <div className="text-emerald-400">✓ Ingress endpoint ready at https://app.byo-paas.dev</div>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex justify-between items-center z-10">
          <span>© {new Date().getFullYear()} BuildYourOwn PaaS</span>
          <span>v1.0-beta</span>
        </div>
      </div>
    </div>
  )
}
