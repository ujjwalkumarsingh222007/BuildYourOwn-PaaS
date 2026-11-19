import * as React from "react"
import { 
  GitBranch, 
  Layers, 
  Container, 
  Server, 
  Globe, 
  ArrowRight 
} from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      icon: GitBranch,
      title: "Source Code",
      desc: "Connect your GitHub repository with automated webhooks or drag-and-drop a ZIP source bundle.",
      badge: "GitHub / ZIP",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      step: "02",
      icon: Layers,
      title: "BuildKit Engine",
      desc: "Automated multi-stage build creates optimized, minimal Docker images with layered caching.",
      badge: "Fast Parallel Builds",
      gradient: "from-cyan-500 to-indigo-500",
    },
    {
      step: "03",
      icon: Container,
      title: "Container Registry",
      desc: "Images are tagged, security-scanned, and pushed to the internal OCI container registry.",
      badge: "OCI Compliant",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      step: "04",
      icon: Server,
      title: "Kubernetes K3s",
      desc: "Orchestrated rollout on lightweight K3s nodes with zero-downtime rolling updates and auto-healing.",
      badge: "Self-Healing Pods",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      step: "05",
      icon: Globe,
      title: "Live Application URL",
      desc: "Instant Traefik reverse-proxy routing with automated TLS certificate generation and health tracking.",
      badge: "SSL / Custom Domain",
      gradient: "from-pink-500 to-emerald-500",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-slate-900/30 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            Standardized Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How The Pipeline Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            A battle-tested cloud-native pipeline from raw code to high-availability Kubernetes deployments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon
            return (
              <div 
                key={item.step}
                className="group relative rounded-xl border border-border bg-card/60 p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      {item.badge}
                    </span>
                  </div>

                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${item.gradient} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-semibold text-base text-foreground mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/40">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
