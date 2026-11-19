"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  GitBranch, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  Cpu, 
  HardDrive, 
  Lock, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Terminal, 
  FileArchive, 
  Info,
  Server,
  Sparkles,
  Loader2,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { frameworkOptions, cpuOptions, memoryOptions } from "@/lib/mock-data"
import { useCreateProject } from "@/hooks/use-projects"
import type { DeploymentSource, Framework, EnvVar } from "@/types"
import { toast } from "sonner"

export default function NewProjectWizardPage() {
  const createProjectMutation = useCreateProject()
  const [currentStep, setCurrentStep] = React.useState<number>(1)

  // Step 1: Source
  const [source, setSource] = React.useState<DeploymentSource>("github")
  const [repoUrl, setRepoUrl] = React.useState("https://github.com/developer/my-service")
  const [branch, setBranch] = React.useState("main")
  const [zipFile, setZipFile] = React.useState<File | null>(null)
  const [zipError, setZipError] = React.useState<string | null>(null)

  // Step 2: Configuration
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [framework, setFramework] = React.useState<Framework>("nextjs")
  const [buildCommand, setBuildCommand] = React.useState("npm run build")
  const [startCommand, setStartCommand] = React.useState("npm start")
  const [rootDirectory, setRootDirectory] = React.useState("/")

  // Step 3: Resources
  const [cpu, setCpu] = React.useState("500m")
  const [memory, setMemory] = React.useState("512Mi")
  const [replicas, setReplicas] = React.useState(2)

  // Step 4: Environment Variables
  const [envVars, setEnvVars] = React.useState<EnvVar[]>([
    { key: "NODE_ENV", value: "production", isSecret: false },
    { key: "PORT", value: "3000", isSecret: false },
  ])
  const [newKey, setNewKey] = React.useState("")
  const [newValue, setNewValue] = React.useState("")
  const [newIsSecret, setNewIsSecret] = React.useState(false)
  const [revealedSecrets, setRevealedSecrets] = React.useState<Record<number, boolean>>({})

  // Step 5: Simulation state
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [simulatedProgress, setSimulatedProgress] = React.useState(0)
  const [activeStepText, setActiveStepText] = React.useState("")
  const [isDeploymentDone, setIsDeploymentDone] = React.useState(false)
  const [createdProjectId, setCreatedProjectId] = React.useState<string | null>(null)

  // Automatically update build/start commands when framework changes
  const handleFrameworkChange = (val: Framework) => {
    setFramework(val)
    if (val === "nextjs") {
      setBuildCommand("npm run build")
      setStartCommand("npm start")
    } else if (val === "react" || val === "vue" || val === "angular") {
      setBuildCommand("npm run build")
      setStartCommand("serve -s build")
    } else if (val === "express") {
      setBuildCommand("npm run build")
      setStartCommand("node dist/index.js")
    } else if (val === "fastapi" || val === "flask") {
      setBuildCommand("pip install -r requirements.txt")
      setStartCommand("uvicorn main:app --host 0.0.0.0")
    } else if (val === "django") {
      setBuildCommand("pip install -r requirements.txt && python manage.py migrate")
      setStartCommand("gunicorn config.wsgi:application --bind 0.0.0.0:8000")
    } else if (val === "go") {
      setBuildCommand("go build -o main .")
      setStartCommand("./main")
    } else if (val === "rust") {
      setBuildCommand("cargo build --release")
      setStartCommand("./target/release/app")
    }
  }

  // Handle ZIP file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".zip")) {
      setZipError("Please select a valid .zip archive file")
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setZipError("ZIP file size cannot exceed 50MB")
      return
    }

    setZipFile(file)
    if (!name) {
      setName(file.name.replace(".zip", "").toLowerCase().replace(/[^a-z0-9-]/g, "-"))
    }
    toast.success(`Selected archive: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`)
  }

  // Add environment variable
  const addEnvVar = () => {
    if (!newKey.trim()) {
      toast.error("Environment variable key is required")
      return
    }
    setEnvVars([...envVars, { key: newKey.trim(), value: newValue.trim(), isSecret: newIsSecret }])
    setNewKey("")
    setNewValue("")
    setNewIsSecret(false)
    toast.success(`Added ${newKey}`)
  }

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index))
  }

  const toggleReveal = (index: number) => {
    setRevealedSecrets((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  // Execute FastAPI Backend Build & Manifest Pipeline
  const startSimulatedDeployment = async () => {
    setIsDeploying(true)
    setSimulatedProgress(25)
    setActiveStepText("Uploading source / registering project in FastAPI control plane...")

    try {
      const created = await createProjectMutation.mutateAsync({
        source,
        repositoryUrl: source === "github" ? repoUrl : undefined,
        branch: source === "github" ? branch : undefined,
        zipFile: source === "zip" ? zipFile || undefined : undefined,
        name: name.trim() || "new-service",
        description,
        framework,
        buildCommand,
        startCommand,
        rootDirectory,
        cpu,
        memory,
        replicas,
        envVars,
      })
      setCreatedProjectId(created.id)
      setSimulatedProgress(70)
      setActiveStepText("Background pipeline worker extracting source, building Dockerfile & K3s manifests...")

      setTimeout(() => {
        setSimulatedProgress(100)
        setActiveStepText("Pipeline queued & executing on FastAPI backend! Open Project or Deployments to inspect logs & manifests.")
        setIsDeploying(false)
        setIsDeploymentDone(true)
        toast.success("Project queued in FastAPI pipeline!", {
          description: "Dockerfile and Kubernetes K3s YAML manifests generated.",
        })
      }, 900)
    } catch (err) {
      setIsDeploying(false)
      toast.error(err instanceof Error ? err.message : "Failed to create project in FastAPI backend")
    }
  }

  const steps = [
    { number: 1, title: "Source" },
    { number: 2, title: "Configuration" },
    { number: 3, title: "Resources" },
    { number: 4, title: "Env Variables" },
    { number: 5, title: "Deploy" },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Wizard Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to projects
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Create New Project
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure container parameters and initiate automated Kubernetes deployment.
        </p>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="grid grid-cols-5 gap-2 border-b border-border pb-6">
        {steps.map((s) => {
          const isDone = currentStep > s.number || isDeploymentDone
          const isCurrent = currentStep === s.number && !isDeploymentDone

          return (
            <div
              key={s.number}
              onClick={() => !isDeploying && s.number < currentStep && setCurrentStep(s.number)}
              className={`flex flex-col items-center sm:items-start text-center sm:text-left cursor-pointer transition-colors ${
                isCurrent
                  ? "text-primary"
                  : isDone
                  ? "text-emerald-400"
                  : "text-muted-foreground/60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                      : isDone
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : s.number}
                </div>
                <span className="hidden sm:inline font-semibold text-xs text-foreground">
                  {s.title}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* STEP 1: Choose Source */}
      {currentStep === 1 && (
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Step 1: Choose Application Source</CardTitle>
            <CardDescription className="text-xs">
              Select whether to build from a Git repository or upload a local project archive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GitHub Card */}
              <div
                onClick={() => setSource("github")}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  source === "github"
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/30"
                    : "border-border hover:border-border/80 bg-background/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <GitBranch className="h-5 w-5" />
                  </div>
                  {source === "github" && (
                    <Badge className="bg-primary text-primary-foreground text-[10px]">
                      Selected
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-sm text-foreground">GitHub Repository</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Connect public or private repository with automatic push-to-deploy webhooks.
                </p>
              </div>

              {/* ZIP Upload Card */}
              <div
                onClick={() => setSource("zip")}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  source === "zip"
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/30"
                    : "border-border hover:border-border/80 bg-background/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  {source === "zip" && (
                    <Badge className="bg-primary text-primary-foreground text-[10px]">
                      Selected
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-sm text-foreground">ZIP Archive Upload</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Upload an archived folder directly. Automatic extraction and containerization.
                </p>
              </div>
            </div>

            {source === "github" ? (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="repoUrl">Repository URL</Label>
                  <Input
                    id="repoUrl"
                    placeholder="https://github.com/organization/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Public or authorized private GitHub repository link.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Production Branch</Label>
                  <Input
                    id="branch"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>Project ZIP Archive</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-background/50 hover:border-primary/50 transition-colors relative">
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileArchive className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-xs font-semibold text-foreground">
                      {zipFile ? zipFile.name : "Click to select or drag & drop .zip archive"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Max file size: 50MB. Exclude node_modules and .git for faster builds.
                    </p>
                  </div>
                  {zipError && (
                    <p className="text-xs text-destructive font-medium">{zipError}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => {
                  if (source === "zip" && !zipFile) {
                    toast.error("Please upload a ZIP archive first")
                    return
                  }
                  if (source === "github" && !repoUrl) {
                    toast.error("Please specify a GitHub repository URL")
                    return
                  }
                  setCurrentStep(2)
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Continue to Configuration <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Configure Project */}
      {currentStep === 2 && (
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Step 2: Configure Project & Commands</CardTitle>
            <CardDescription className="text-xs">
              Define runtime frameworks, build scripts, and execution root directories.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name (unique identifier)</Label>
                <Input
                  id="name"
                  placeholder="e.g. customer-api"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="framework">Application Framework</Label>
                <Select value={framework} onValueChange={(v: Framework) => handleFrameworkChange(v)}>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select Framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworkOptions.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Project Description</Label>
              <Textarea
                id="desc"
                placeholder="High-performance backend API service..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buildCmd">Build Command</Label>
                <Input
                  id="buildCmd"
                  placeholder="npm run build"
                  value={buildCommand}
                  onChange={(e) => setBuildCommand(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startCmd">Start / Entrypoint Command</Label>
                <Input
                  id="startCmd"
                  placeholder="npm start"
                  value={startCommand}
                  onChange={(e) => setStartCommand(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rootDir">Root Directory</Label>
              <Input
                id="rootDir"
                placeholder="/"
                value={rootDirectory}
                onChange={(e) => setRootDirectory(e.target.value)}
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={() => {
                  if (!name.trim()) {
                    toast.error("Please provide a project name")
                    return
                  }
                  setCurrentStep(3)
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Configure Resources <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Resource Configuration */}
      {currentStep === 3 && (
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Step 3: Resource Allocation & Replicas</CardTitle>
            <CardDescription className="text-xs">
              Set cgroup CPU and memory boundaries, and configure the target replica count.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu">vCPU Limit</Label>
                <Select value={cpu} onValueChange={setCpu}>
                  <SelectTrigger id="cpu">
                    <SelectValue placeholder="Select CPU" />
                  </SelectTrigger>
                  <SelectContent>
                    {cpuOptions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label} ({c.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">K3s container CPU quota.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memory">Memory Boundary</Label>
                <Select value={memory} onValueChange={setMemory}>
                  <SelectTrigger id="memory">
                    <SelectValue placeholder="Select Memory" />
                  </SelectTrigger>
                  <SelectContent>
                    {memoryOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label} ({m.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">OOM killer trigger threshold.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="replicas">Pod Replicas ({replicas})</Label>
                <div className="flex items-center gap-3 pt-1">
                  {[1, 2, 3, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setReplicas(count)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                        replicas === count
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background hover:bg-muted text-foreground"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">Load-balanced across nodes.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background/60 flex items-center gap-4 text-xs">
              <Server className="h-6 w-6 text-primary shrink-0" />
              <div>
                <span className="font-semibold text-foreground">Total Cluster Footprint: </span>
                <span className="font-mono text-muted-foreground">
                  {replicas} pods × ({cpu} CPU, {memory} RAM) = {replicas * parseFloat(cpu)} vCPU equivalent
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Set Environment Variables <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: Environment Variables */}
      {currentStep === 4 && (
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Step 4: Environment Variables & Secrets</CardTitle>
            <CardDescription className="text-xs">
              Configure environment parameters injected directly into your pods at runtime.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add new variable row */}
            <div className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
              <div className="text-xs font-semibold text-foreground">Add Environment Key / Value</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5 space-y-1">
                  <Label className="text-[11px]">Key</Label>
                  <Input
                    placeholder="DATABASE_URL"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
                    className="font-mono text-xs uppercase"
                  />
                </div>
                <div className="sm:col-span-5 space-y-1">
                  <Label className="text-[11px]">Value</Label>
                  <Input
                    placeholder="postgresql://..."
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    type={newIsSecret ? "password" : "text"}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    onClick={addEnvVar}
                    className="w-full text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="secretToggle"
                  checked={newIsSecret}
                  onChange={(e) => setNewIsSecret(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <Label htmlFor="secretToggle" className="text-xs font-normal cursor-pointer text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Mark as secret (masked in logs & dashboard)
                </Label>
              </div>
            </div>

            {/* List of variables */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Configured Variables ({envVars.length})</div>
              {envVars.length === 0 ? (
                <div className="p-4 text-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                  No environment variables added yet.
                </div>
              ) : (
                <div className="divide-y divide-border rounded-xl border border-border bg-background/50">
                  {envVars.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-2.5 flex-1 truncate">
                        {item.isSecret && <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                        <span className="font-bold text-foreground">{item.key}</span>
                        <span className="text-muted-foreground">=</span>
                        <span className="text-muted-foreground truncate">
                          {item.isSecret && !revealedSecrets[idx] ? "••••••••••••••••" : item.value}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.isSecret && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => toggleReveal(idx)}
                            title={revealedSecrets[idx] ? "Hide secret" : "Reveal secret"}
                          >
                            {revealedSecrets[idx] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => removeEnvVar(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={() => setCurrentStep(5)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Review & Confirm <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 5: Review & Confirm */}
      {currentStep === 5 && (
        <Card className="border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Step 5: Review & Simulate Deployment</CardTitle>
            <CardDescription className="text-xs">
              Verify your pipeline parameters before launching the automated build.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Simulation Clarification Banner */}
            <Alert className="border-primary/40 bg-primary/10">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <AlertDescription className="text-xs text-foreground leading-relaxed">
                <span className="font-semibold text-primary">Simulated Pipeline:</span> This deployment will run through our simulated BuildKit → Container Registry → K3s rollout pipeline with real progression logs.
              </AlertDescription>
            </Alert>

            {/* Configuration Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                <div className="text-[11px] text-muted-foreground uppercase font-sans font-semibold">Source & Project</div>
                <div className="flex justify-between"><span className="text-muted-foreground">Project Name:</span> <span className="text-foreground font-bold">{name || "unnamed-project"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Source Type:</span> <span className="text-foreground">{source === "github" ? "GitHub" : "ZIP Upload"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Framework:</span> <span className="text-foreground uppercase">{framework}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Build Command:</span> <span className="text-foreground">{buildCommand}</span></div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background/50 space-y-2">
                <div className="text-[11px] text-muted-foreground uppercase font-sans font-semibold">Resources & Routing</div>
                <div className="flex justify-between"><span className="text-muted-foreground">vCPU Quota:</span> <span className="text-foreground">{cpu}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Memory Quota:</span> <span className="text-foreground">{memory}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pod Replicas:</span> <span className="text-foreground">{replicas} active</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Env Variables:</span> <span className="text-foreground">{envVars.length} injected</span></div>
              </div>
            </div>

            {/* Active Simulation Progress */}
            {isDeploying && (
              <div className="p-6 rounded-2xl border border-primary/40 bg-slate-950 text-white space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-primary font-bold">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Deploying Pipeline...
                  </span>
                  <span>{simulatedProgress}%</span>
                </div>
                <Progress value={simulatedProgress} className="h-2" />
                <div className="text-emerald-400 text-xs bg-slate-900 p-3 rounded-lg border border-slate-800">
                  {activeStepText}
                </div>
              </div>
            )}

            {/* Success Finish State */}
            {isDeploymentDone && (
              <div className="p-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-foreground text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-lg">Project Created &amp; Pipeline Queued!</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  The FastAPI backend extracted your source, generated the multi-stage Dockerfile and K3s manifests ({replicas} replica spec), and recorded the build logs.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Link href="/deployments">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                      Inspect Logs &amp; Manifests
                    </Button>
                  </Link>
                  <Link href={createdProjectId ? `/projects/${createdProjectId}` : "/projects"}>
                    <Button variant="outline">
                      Open Project Details
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {!isDeploying && !isDeploymentDone && (
              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={startSimulatedDeployment}
                  className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-blue-500/20 px-8"
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Create &amp; Run Pipeline
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
