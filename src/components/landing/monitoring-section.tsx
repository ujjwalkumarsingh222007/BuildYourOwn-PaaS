import * as React from "react"
import Link from "next/link"
import { Activity, Cpu, HardDrive, Wifi, Bell, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MonitoringSection() {
  return (
    <section className="py-20 md:py-28 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
              <Activity className="h-3 w-3" /> Live Observability
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Instant Metrics. No Agents to Install.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Every container deployed on BuildYourOwn PaaS is automatically tracked with sub-second latency. Keep an eye on memory headroom, CPU throttling, and request latency right from your project dashboard.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-xl border border-border bg-card/60">
                <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-1">
                  <Cpu className="h-4 w-4" /> CPU & Memory
                </div>
                <div className="text-xs text-muted-foreground">
                  Track container cgroup utilization with 24-hour historical trends.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card/60">
                <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold mb-1">
                  <Wifi className="h-4 w-4" /> Ingress Traffic
                </div>
                <div className="text-xs text-muted-foreground">
                  Monitor live HTTP 2xx, 4xx, and 5xx response rates and latency.
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/monitoring">
                <Button variant="outline" className="font-semibold">
                  View Metrics Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Chart Visual */}
          <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-foreground">Cluster Telemetry Stream</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live
              </span>
            </div>

            {/* Mock Visual Waveforms */}
            <div className="py-6 space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Average Cluster CPU Load</span>
                  <span className="font-mono text-foreground font-semibold">34.2%</span>
                </div>
                <div className="h-16 w-full flex items-end gap-1 px-1 py-1 rounded-lg bg-background border border-border/80">
                  {[24, 30, 28, 42, 36, 50, 48, 62, 54, 40, 32, 38, 45, 52, 48, 36, 29, 34, 40, 38, 32, 28, 35, 34].map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm hover:opacity-80 transition-opacity"
                      style={{ height: `${v}%` }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Aggregated Memory Utilization</span>
                  <span className="font-mono text-foreground font-semibold">46.5%</span>
                </div>
                <div className="h-16 w-full flex items-end gap-1 px-1 py-1 rounded-lg bg-background border border-border/80">
                  {[45, 46, 44, 48, 47, 50, 52, 53, 51, 49, 48, 46, 47, 48, 46, 45, 47, 46, 47, 48, 49, 47, 46, 46].map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t-sm hover:opacity-80 transition-opacity"
                      style={{ height: `${v}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Sampling interval: 1s</span>
              <span>Buffer: 24h rolling</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
