"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpen,
  Cloud,
  Server,
  Terminal,
  Copy,
  Check,
  ArrowRight,
  Layers,
  FolderGit2,
  Activity,
  Settings,
  AlertTriangle,
  UploadCloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

export default function GuideBookPage() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const stsCommand = "aws sts get-session-token --duration-seconds 3600"
  const ec2DeployCommand = `# On an AWS EC2 Ubuntu instance (with ports 3000 & 8000 open in Security Group):
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 git
git clone <your-repo-url> buildyourown-paas && cd buildyourown-paas
# Replace localhost with your EC2 Public IP:
export EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
sed -i "s|http://localhost:8000/api/v1|http://$EC2_IP:8000/api/v1|g" docker-compose.yml
sed -i "s|http://localhost:3000|http://$EC2_IP:3000|g" docker-compose.yml
sudo docker compose up -d --build`

  const pagesGuide = [
    {
      route: "/",
      title: "Landing Page",
      icon: BookOpen,
      summary: "Product overview, deployment pipeline summary, and direct entry into the console.",
    },
    {
      route: "/dashboard",
      title: "Overview Dashboard",
      icon: Activity,
      summary: "Live project/deployment counts, host CPU/memory charts, and AWS session status.",
    },
    {
      route: "/projects/new",
      title: "Deploy New Project Wizard",
      icon: FolderGit2,
      summary: "Upload a ZIP archive (up to 50 MB) or enter a GitHub repo URL, configure CPU/RAM/replicas & env vars, and generate Dockerfile + K3s YAML.",
    },
    {
      route: "/deployments",
      title: "Deployments & Artifacts",
      icon: Layers,
      summary: "Inspect pipeline logs, view generated Dockerfile & K3s YAML manifests, and push bundles to your AWS S3 bucket.",
    },
    {
      route: "/aws-connections",
      title: "AWS Session Connection",
      icon: Cloud,
      summary: "Connect using temporary AWS STS credentials (AccessKeyId, SecretAccessKey, SessionToken, Region) kept strictly in backend memory.",
    },
    {
      route: "/infrastructure",
      title: "Infrastructure & AWS Discovery",
      icon: Server,
      summary: "Inspect host build tools and live AWS VPCs, EC2 instances, ECR repositories, EKS clusters, and S3 buckets.",
    },
    {
      route: "/monitoring",
      title: "Monitoring",
      icon: Activity,
      summary: "Real-time CPU and memory graphs sampled from the backend host.",
    },
    {
      route: "/settings",
      title: "Settings",
      icon: Settings,
      summary: "Workspace defaults, Dark/Light theme switcher, notifications, and FastAPI endpoint configuration.",
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            AWS Connection &amp; Website Guide
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your AWS account with temporary STS session credentials, push project bundles to S3, or host this platform on AWS.
          </p>
        </div>

        <Link href="/aws-connections">
          <Button size="sm" className="text-xs h-9 gap-1.5">
            <Cloud className="h-3.5 w-3.5" /> Open AWS Connections
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="session" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="session">1. Connect AWS Session</TabsTrigger>
          <TabsTrigger value="host-aws">2. Host Website on AWS</TabsTrigger>
          <TabsTrigger value="website">3. Website Guide</TabsTrigger>
        </TabsList>

        {/* TAB 1: CONNECT AWS SESSION */}
        <TabsContent value="session" className="space-y-6">
          <Alert className="border-amber-500/30 bg-amber-500/10 text-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
              Your temporary AWS credentials (<code className="font-mono text-foreground">ASIA...</code> Access Key ID, Secret Access Key, and Session Token) are held strictly in FastAPI process memory and never saved to disk or browser storage.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/80 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Step 1: Get Temporary Session</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                From AWS IAM Identity Center (SSO Portal → Command line or programmatic access) or AWS CLI (<code className="font-mono">aws sts get-session-token</code>), copy AccessKeyId, SecretAccessKey, and SessionToken.
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Step 2: Connect in Console</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                Go to <Link href="/aws-connections" className="text-primary hover:underline">/aws-connections</Link>, paste all three fields, choose your AWS Region, and click <strong>Connect AWS</strong>.
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Step 3: Upload &amp; Inspect</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                View your VPCs, EC2 instances, and S3 buckets under <Link href="/infrastructure" className="text-primary hover:underline">/infrastructure</Link>, or push deployment bundles to S3 from <Link href="/deployments" className="text-primary hover:underline">/deployments</Link>.
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Generate Temporary Credentials via AWS CLI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => copySnippet("sts", stsCommand)}
                >
                  {copiedId === "sts" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </Button>
              </div>
              <pre className="p-3.5 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                {stsCommand}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: HOST THIS WEBSITE ON AWS */}
        <TabsContent value="host-aws" className="space-y-6">
          <Card className="border-border/80 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-primary" />
                Deploy BuildYourOwn PaaS on AWS EC2 (Docker Compose)
              </CardTitle>
              <CardDescription className="text-xs">
                The repository includes production Dockerfiles (<code className="font-mono">Dockerfile</code>, <code className="font-mono">backend/Dockerfile</code>, and <code className="font-mono">docker-compose.yml</code>) ready to upload and run on AWS EC2.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => copySnippet("ec2", ec2DeployCommand)}
                >
                  {copiedId === "ec2" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Commands
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                {ec2DeployCommand}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: FULL WEBSITE GUIDE */}
        <TabsContent value="website" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pagesGuide.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.route} className="border-border/80 bg-card/60 flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      {item.title}
                    </CardTitle>
                    <div className="font-mono text-[11px] text-muted-foreground">{item.route}</div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.summary}</p>
                    <Link href={item.route}>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                        Open Page <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
