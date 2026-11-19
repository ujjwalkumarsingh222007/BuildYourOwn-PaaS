"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { 
  Settings, 
  Palette, 
  Bell, 
  Server, 
  Check, 
  Sun, 
  Moon, 
  Monitor,
  Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [workspaceName, setWorkspaceName] = React.useState("my-workspace")
  const [defaultNamespace, setDefaultNamespace] = React.useState("production")
  const [domainSuffix, setDomainSuffix] = React.useState("byo-paas.local")

  const [notifyOnDeployFail, setNotifyOnDeployFail] = React.useState(true)
  const [notifyOnDeploySuccess, setNotifyOnDeploySuccess] = React.useState(true)
  const [notifyOnHighCpu, setNotifyOnHighCpu] = React.useState(true)

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Workspace preferences saved")
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Platform Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure workspace defaults, appearance theme, notifications, and backend API endpoint.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backend">Backend API</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Workspace Defaults
              </CardTitle>
              <CardDescription className="text-xs">
                Default Kubernetes namespace and routing configuration for deployments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workspaceName" className="text-xs">Workspace Slug</Label>
                  <Input
                    id="workspaceName"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultNs" className="text-xs">Default K3s Namespace</Label>
                    <Input
                      id="defaultNs"
                      value={defaultNamespace}
                      onChange={(e) => setDefaultNamespace(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domainSuffix" className="text-xs">Ingress Domain Suffix</Label>
                    <Input
                      id="domainSuffix"
                      value={domainSuffix}
                      onChange={(e) => setDomainSuffix(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button type="submit" size="sm" className="text-xs font-semibold gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Palette className="h-4 w-4 text-violet-400" />
                Theme Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Choose your preferred console appearance.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "dark", label: "Dark Navy", icon: Moon, desc: "High contrast charcoal & navy" },
                { id: "light", label: "Clean Light", icon: Sun, desc: "Crisp daylight workspace" },
                { id: "system", label: "System Sync", icon: Monitor, desc: "Match OS preference" },
              ].map((item) => {
                const Icon = item.icon
                const active = theme === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTheme(item.id)
                      toast.success(`Theme switched to ${item.label}`)
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      active
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border bg-background/50 hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="font-semibold text-sm text-foreground">{item.label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-400" />
                Alerting &amp; Notifications
              </CardTitle>
              <CardDescription className="text-xs">
                Control which pipeline events trigger toast alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/50">
                <div>
                  <div className="text-sm font-semibold text-foreground">Deployment Failures</div>
                  <div className="text-xs text-muted-foreground">Alert when a build or rollout fails.</div>
                </div>
                <Switch checked={notifyOnDeployFail} onCheckedChange={setNotifyOnDeployFail} />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/50">
                <div>
                  <div className="text-sm font-semibold text-foreground">Successful Rollouts</div>
                  <div className="text-xs text-muted-foreground">Confirm when deployment artifacts complete.</div>
                </div>
                <Switch checked={notifyOnDeploySuccess} onCheckedChange={setNotifyOnDeploySuccess} />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/50">
                <div>
                  <div className="text-sm font-semibold text-foreground">Host Resource Warnings</div>
                  <div className="text-xs text-muted-foreground">Warn when CPU or memory exceeds 80%.</div>
                </div>
                <Switch checked={notifyOnHighCpu} onCheckedChange={setNotifyOnHighCpu} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backend">
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-400" />
                FastAPI Control Plane
              </CardTitle>
              <CardDescription className="text-xs">
                API endpoint configured via <code className="font-mono">NEXT_PUBLIC_API_URL</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs">
              <div className="p-4 rounded-xl border border-border bg-background/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">FastAPI Backend URL</div>
                  <div className="font-mono text-muted-foreground mt-0.5">{apiBaseUrl}</div>
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 font-mono text-[10px]">
                  CONNECTED
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
