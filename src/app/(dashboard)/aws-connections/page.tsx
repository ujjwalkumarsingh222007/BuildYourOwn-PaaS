"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Cloud, 
  ShieldAlert, 
  KeyRound, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Clock,
  Eye,
  EyeOff,
  ServerCrash,
  ShieldCheck,
  PowerOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  connectAws,
  disconnectAws,
  fetchAwsConnection,
  testAwsConnection,
} from "@/services/api"
import type { AwsConnection } from "@/types"
import { toast } from "sonner"

const awsCredentialsSchema = z.object({
  accessKeyId: z
    .string()
    .min(16, "AWS Access Key ID must be at least 16 characters")
    .max(128, "Invalid Access Key ID length")
    .regex(/^[A-Z0-9]+$/, "Access Key ID must contain only uppercase alphanumeric characters"),
  secretAccessKey: z
    .string()
    .min(20, "Secret Access Key must be at least 20 characters"),
  sessionToken: z.string().optional(),
  region: z.string().min(1, "Please select an AWS region"),
})

type AwsCredentialsFormValues = z.infer<typeof awsCredentialsSchema>

const awsRegions = [
  { value: "us-east-1", label: "US East (N. Virginia) — us-east-1" },
  { value: "us-east-2", label: "US East (Ohio) — us-east-2" },
  { value: "us-west-1", label: "US West (N. California) — us-west-1" },
  { value: "us-west-2", label: "US West (Oregon) — us-west-2" },
  { value: "eu-west-1", label: "Europe (Ireland) — eu-west-1" },
  { value: "eu-central-1", label: "Europe (Frankfurt) — eu-central-1" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai) — ap-south-1" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore) — ap-southeast-1" },
]

export default function AwsConnectionsPage() {
  const queryClient = useQueryClient()
  const { data: fetchedStatus } = useQuery({
    queryKey: ["aws-status"],
    queryFn: fetchAwsConnection,
  })

  const [localState, setLocalState] = React.useState<AwsConnection | null>(null)
  const connectionState: AwsConnection = localState ?? fetchedStatus ?? { status: "disconnected" }

  const [showSecret, setShowSecret] = React.useState(false)
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [isTesting, setIsTesting] = React.useState(false)
  const [backendError, setBackendError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AwsCredentialsFormValues>({
    resolver: zodResolver(awsCredentialsSchema),
    defaultValues: {
      accessKeyId: "",
      secretAccessKey: "",
      sessionToken: "",
      region: "us-east-1",
    },
  })

  const selectedRegion = watch("region")

  const onConnect = async (data: AwsCredentialsFormValues) => {
    setIsConnecting(true)
    setBackendError(null)
    try {
      const result = await connectAws({
        accessKeyId: data.accessKeyId,
        secretAccessKey: data.secretAccessKey,
        sessionToken: data.sessionToken || undefined,
        region: data.region,
      })
      setLocalState(result)
      await queryClient.invalidateQueries({ queryKey: ["aws-status"] })
      await queryClient.invalidateQueries({ queryKey: ["recent-activity"] })
      toast.success("Connected to AWS via STS", {
        description: `Account ${result.accountId} authenticated in ${result.region}`,
      })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to validate AWS STS credentials on FastAPI backend."
      setLocalState({ status: "error" })
      setBackendError(message)
      toast.error("AWS Connection Failed", {
        description: message,
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setBackendError(null)
    try {
      const res = await testAwsConnection()
      if (!res.success) {
        setBackendError(res.message)
        toast.warning("Connection Test Unsuccessful", {
          description: res.message,
        })
      } else {
        toast.success("AWS STS Verified", { description: res.message })
      }
      await queryClient.invalidateQueries({ queryKey: ["aws-status"] })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Test connection failed."
      setBackendError(message)
      toast.error(message)
    } finally {
      setIsTesting(false)
    }
  }

  const handleDisconnect = async () => {
    await disconnectAws()
    setLocalState({ status: "disconnected" })
    reset()
    setBackendError(null)
    await queryClient.invalidateQueries({ queryKey: ["aws-status"] })
    toast.info("AWS session cleared from backend memory")
  }

  const handleClearForm = () => {
    reset()
    setBackendError(null)
    toast.info("Form credentials cleared from browser memory")
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              AWS Cloud Connections
            </h1>
            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
              Administrator Only
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Validate temporary AWS STS or IAM credentials server-side via FastAPI + boto3.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {connectionState.status === "connected" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="text-xs h-9 gap-1.5 text-destructive hover:text-destructive"
            >
              <PowerOff className="h-3.5 w-3.5" />
              Disconnect
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? "animate-spin" : ""}`} />
            {isTesting ? "Testing STS..." : "Test Connection"}
          </Button>
        </div>
      </div>

      {/* Security Policy Notice */}
      <Alert className="border-amber-500/30 bg-amber-500/10 text-foreground">
        <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
        <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Zero Persistence Security Policy:</span> AWS credentials are never stored in browser storage (<code className="font-mono text-foreground">localStorage</code> / <code className="font-mono text-foreground">sessionStorage</code> / cookies) and are never written to SQLite on the backend. FastAPI holds the active session in process memory only and validates it with real <code className="font-mono text-foreground">boto3 sts.get_caller_identity()</code>.
        </AlertDescription>
      </Alert>

      {backendError && (
        <Alert className="border-destructive/40 bg-destructive/10 text-foreground">
          <ServerCrash className="h-4 w-4 text-destructive shrink-0" />
          <AlertDescription className="text-xs text-destructive leading-relaxed font-medium">
            {backendError}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Credential Form */}
        <Card className="lg:col-span-2 border-border/80 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              IAM / Temporary STS Credentials
            </CardTitle>
            <CardDescription className="text-xs">
              For temporary sessions (<code className="font-mono">ASIA...</code>), paste all three values: Access Key ID, Secret Access Key, and Session Token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onConnect)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="accessKeyId" className="text-xs font-semibold">
                  AWS Access Key ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="accessKeyId"
                  placeholder="ASIA... or AKIA..."
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono text-xs"
                  {...register("accessKeyId")}
                />
                {errors.accessKeyId && (
                  <p className="text-xs text-destructive">{errors.accessKeyId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretAccessKey" className="text-xs font-semibold">
                  AWS Secret Access Key <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="secretAccessKey"
                    type={showSecret ? "text" : "password"}
                    placeholder="wJalrXUtnFEMI/K7MDENG/..."
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono text-xs pr-10"
                    {...register("secretAccessKey")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    aria-label={showSecret ? "Hide secret access key" : "Show secret access key"}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.secretAccessKey && (
                  <p className="text-xs text-destructive">{errors.secretAccessKey.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionToken" className="text-xs font-semibold flex items-center justify-between">
                  <span>AWS Session Token (Required for ASIA... temporary credentials)</span>
                  <span className="text-[10px] font-normal text-muted-foreground">STS / SSO</span>
                </Label>
                <Textarea
                  id="sessionToken"
                  placeholder="FwoGZXIvYXdzE..."
                  rows={3}
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono text-xs"
                  {...register("sessionToken")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region" className="text-xs font-semibold">
                  Target AWS Region <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedRegion}
                  onValueChange={(val) => setValue("region", val, { shouldValidate: true })}
                >
                  <SelectTrigger id="region" className="font-mono text-xs">
                    <SelectValue placeholder="Select AWS region" />
                  </SelectTrigger>
                  <SelectContent>
                    {awsRegions.map((r) => (
                      <SelectItem key={r.value} value={r.value} className="font-mono text-xs">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.region && (
                  <p className="text-xs text-destructive">{errors.region.message}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearForm}
                  className="text-xs text-muted-foreground"
                >
                  Clear Form
                </Button>

                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={isTesting || isConnecting}
                    className="text-xs font-semibold"
                  >
                    {isTesting ? "Testing..." : "Test Connection"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                  >
                    {isConnecting ? "Validating STS..." : "Connect AWS"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right: Connection Status, Account Info & Expiration */}
        <div className="space-y-6">
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-primary" />
                  Connection Status
                </CardTitle>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    connectionState.status === "connected"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : connectionState.status === "error" || connectionState.status === "expired"
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {connectionState.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-background/60 border border-border flex items-center gap-2.5">
                {connectionState.status === "connected" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-muted-foreground leading-snug">
                  {connectionState.status === "connected"
                    ? "AWS STS session verified by FastAPI backend."
                    : "No active AWS STS session in backend memory."}
                </span>
              </div>

              {connectionState.services && connectionState.services.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-muted-foreground">Service Probes</div>
                  {connectionState.services.map((svc) => (
                    <div
                      key={svc.name}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded bg-background/50 border border-border/60 font-mono text-[11px]"
                    >
                      <span>{svc.name}</span>
                      <span
                        className={
                          svc.status === "available"
                            ? "text-emerald-400"
                            : svc.status === "limited"
                            ? "text-amber-400"
                            : "text-destructive"
                        }
                      >
                        {svc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-sans">Account ID</span>
                <span className="text-foreground">
                  {connectionState.accountId || "Not connected"}
                </span>
              </div>
              <div className="flex justify-between gap-2 py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-sans shrink-0">IAM Principal</span>
                <span className="text-foreground truncate" title={connectionState.iamUser}>
                  {connectionState.iamUser || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground font-sans">Active Region</span>
                <span className="text-foreground">
                  {connectionState.region || selectedRegion}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                Credential Expiration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between gap-2 py-1.5 border-b border-border/60">
                <span className="text-muted-foreground shrink-0">Session TTL</span>
                <span className="font-mono text-foreground text-right">
                  {connectionState.expiresAt || "No active session"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Temporary STS tokens expire automatically after their configured duration. Use &quot;Test Connection&quot; to check whether your token is still valid.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
