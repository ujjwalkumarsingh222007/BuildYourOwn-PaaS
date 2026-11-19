"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    toast.success("Password reset request recorded")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Reset password
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Enter your email address to reset your workspace password.
        </p>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl border border-border bg-card text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-base text-foreground">Request Submitted</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If an account exists for <span className="text-foreground font-medium">{email}</span>, recovery instructions apply.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Back to Sign in
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Send Reset Link
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
