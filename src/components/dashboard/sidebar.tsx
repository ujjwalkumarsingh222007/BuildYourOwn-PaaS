"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { 
  Rocket, 
  LayoutDashboard, 
  FolderGit2, 
  Layers, 
  Server, 
  Activity, 
  Cloud, 
  Settings,
  Plus,
  ExternalLink,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjects } from "@/hooks/use-projects"
import { useDeployments } from "@/hooks/use-deployments"
import { fetchAwsConnection } from "@/services/api"
import { cn } from "@/lib/utils"

interface SidebarProps {
  onClose?: () => void
}

export function DashboardSidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: projects = [] } = useProjects()
  const { data: deployments = [] } = useDeployments()
  const { data: awsConn } = useQuery({
    queryKey: ["aws-status"],
    queryFn: fetchAwsConnection,
  })

  const awsConnected = awsConn?.status === "connected"

  const navItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      matchExact: true,
    },
    {
      title: "Projects",
      href: "/projects",
      icon: FolderGit2,
      badge: String(projects.length),
    },
    {
      title: "Deployments",
      href: "/deployments",
      icon: Layers,
      badge: String(deployments.length),
    },
    {
      title: "Infrastructure",
      href: "/infrastructure",
      icon: Server,
    },
    {
      title: "Monitoring",
      href: "/monitoring",
      icon: Activity,
    },
    {
      title: "AWS Connections",
      href: "/aws-connections",
      icon: Cloud,
      tag: awsConnected ? "Active" : "Connect",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      title: "AWS Guide",
      href: "/guide",
      icon: BookOpen,
    },
  ]

  return (
    <aside className="w-64 h-full border-r border-border bg-card/60 flex flex-col justify-between backdrop-blur-sm select-none">
      <div>
        <div className="h-16 px-5 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/20">
              <Rocket className="h-4 w-4" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-foreground">BuildYourOwn</span>
              <span className="text-[10px] text-primary font-mono font-semibold tracking-wider uppercase">PaaS Console</span>
            </div>
          </Link>
        </div>

        <div className="p-4">
          <Link href="/projects/new" onClick={onClose}>
            <Button className="w-full justify-center bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-md shadow-blue-500/20 font-semibold text-xs h-9">
              <Plus className="mr-1.5 h-4 w-4" /> New Deployment
            </Button>
          </Link>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.matchExact
              ? pathname === item.href
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  <span>{item.title}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground group-hover:bg-accent"
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {item.tag && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                      isActive
                        ? "bg-white/20 text-white"
                        : awsConnected
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    )}
                  >
                    {item.tag}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom AWS Session Status */}
      <div className="p-4 border-t border-border space-y-3">
        <Link href="/aws-connections" onClick={onClose} className="block">
          <div className="p-3 rounded-xl bg-background/80 border border-border hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${awsConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                AWS Session
              </span>
              <span className={`text-[10px] font-mono font-bold ${awsConnected ? "text-emerald-400" : "text-amber-400"}`}>
                {awsConnected ? "CONNECTED" : "DISCONNECTED"}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Account:</span>
                <span className="text-foreground">{awsConn?.accountId || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Region:</span>
                <span className="text-foreground">{awsConn?.region || "—"}</span>
              </div>
            </div>
          </div>
        </Link>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <Link href="/guide" onClick={onClose} className="hover:text-foreground transition-colors inline-flex items-center gap-1">
            AWS Guide <ExternalLink className="h-3 w-3" />
          </Link>
          <span className="font-mono text-[10px]">BYO PaaS</span>
        </div>
      </div>
    </aside>
  )
}
