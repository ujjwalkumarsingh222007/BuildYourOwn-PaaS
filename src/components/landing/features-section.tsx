import * as React from "react"
import { 
  GitBranch, 
  Upload, 
  Box, 
  Activity, 
  TrendingUp, 
  ShieldCheck,
  Terminal,
  RefreshCw,
  Cpu
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: GitBranch,
      title: "GitHub Auto-Deployment",
      desc: "Connect your repositories. Each push to your production branch automatically triggers build, containerization, and rollout.",
    },
    {
      icon: Upload,
      title: "Zero-Config ZIP Uploads",
      desc: "Drag and drop any ZIP archive. Our builder automatically analyzes your package.json, requirements.txt, or go.mod.",
    },
    {
      icon: Box,
      title: "Kubernetes K3s Core",
      desc: "Production-ready cluster orchestration running on K3s nodes. High density, low overhead, and declarative infrastructure.",
    },
    {
      icon: Activity,
      title: "Real-Time Telemetry",
      desc: "Observe CPU, memory utilization, network traffic, and HTTP request metrics in real-time with responsive graphs.",
    },
    {
      icon: TrendingUp,
      title: "Horizontal Pod Autoscaling",
      desc: "Configure target replica counts and scale from single-container prototypes to enterprise high-throughput services.",
    },
    {
      icon: ShieldCheck,
      title: "Encrypted Secrets & Env Vars",
      desc: "Store environment variables safely. Secrets are masked in UI and injected securely into container runtime environments.",
    },
  ]

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
            Cloud Native Developer Experience
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Engineered for Modern Engineering Teams
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Everything you need to ship full-stack web applications, microservices, and APIs at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="group relative rounded-2xl border border-border/80 bg-card/60 p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
