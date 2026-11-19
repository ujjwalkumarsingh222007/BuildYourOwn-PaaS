import * as React from "react"
import { cn } from "@/lib/utils"

type StatusVariant =
  | "running"
  | "Running"
  | "deploying"
  | "building"
  | "pending"
  | "Pending"
  | "failed"
  | "Failed"
  | "stopped"
  | "rolled_back"
  | "ready"
  | "healthy"
  | "Active"
  | string

const STATUS_STYLES: Record<string, string> = {
  running: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  ready: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  healthy: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  deploying: "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse",
  building: "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse",
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  failed: "bg-destructive/10 text-destructive border border-destructive/20",
  stopped: "bg-muted text-muted-foreground border border-border",
  rolled_back: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
}

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase()
  const style = STATUS_STYLES[normalized] || "bg-muted text-muted-foreground border border-border"

  return (
    <span
      className={cn(
        "text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider inline-flex items-center",
        style,
        className
      )}
    >
      {status.replace("_", " ")}
    </span>
  )
}
