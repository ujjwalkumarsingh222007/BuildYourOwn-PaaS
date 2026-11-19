"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Signed in to workspace")
      router.push("/dashboard")
    }, 300)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Sign in to Console
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Access your projects, deployments, and AWS session connections.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@domain.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••••••"
              className="pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold shadow-md shadow-blue-500/20"
          disabled={loading}
        >
          {loading ? "Opening Console..." : "Sign in"}
        </Button>
      </form>

      <Button
        variant="outline"
        className="w-full border-border hover:bg-accent font-medium"
        onClick={() => router.push("/dashboard")}
      >
        Open Dashboard Directly <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        New workspace?{" "}
        <Link href="/signup" className="text-primary hover:underline font-semibold">
          Create account
        </Link>
      </p>
    </div>
  )
}
