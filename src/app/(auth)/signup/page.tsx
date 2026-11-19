"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Workspace ready")
      router.push("/dashboard")
    }, 300)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Create Workspace Account
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Deploy applications to AWS and Kubernetes K3s.
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder="Your Name"
              className="pl-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

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
          <Label htmlFor="password">Password (min. 8 characters)</Label>
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
              minLength={8}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold shadow-md shadow-blue-500/20"
          disabled={loading}
        >
          {loading ? "Creating..." : "Continue to Console"}
        </Button>
      </form>

      <div className="pt-2 text-center">
        <p className="text-xs text-muted-foreground">
          Already have access?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
