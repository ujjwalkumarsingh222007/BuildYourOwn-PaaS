import * as React from "react"
import Link from "next/link"
import { Check, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PricingSection() {
  const tiers = [
    {
      name: "Developer Beta",
      badge: "Current Free Access",
      price: "$0",
      cadence: "forever during beta",
      desc: "Perfect for personal projects, hackathons, and small side applications.",
      features: [
        "Up to 5 Active Projects",
        "1 GB RAM & 0.5 vCPU per container",
        "Deploy from GitHub or ZIP upload",
        "Automated BuildKit image builds",
        "Traefik SSL live endpoints",
        "Community support on Discord",
      ],
      cta: "Get Started Free",
      highlighted: true,
      href: "/signup",
    },
    {
      name: "Team / Pro",
      badge: "Coming Soon",
      price: "$29",
      cadence: "per seat / month",
      desc: "For growing tech startups and agencies requiring custom resource configurations.",
      features: [
        "Unlimited Projects",
        "Up to 8 GB RAM & 4 vCPU per service",
        "Custom domain support with automated SSL",
        "Autoscaling up to 10 replicas",
        "AWS Custom Account Connection",
        "Priority 99.9% uptime SLA",
      ],
      cta: "Join Waitlist",
      highlighted: false,
      href: "/signup?plan=pro",
    },
    {
      name: "Enterprise Dedicated",
      badge: "Custom Cloud",
      price: "Custom",
      cadence: "tailored infrastructure",
      desc: "Deploy a dedicated K3s or EKS cluster directly into your own AWS VPC infrastructure.",
      features: [
        "Dedicated private Kubernetes cluster",
        "Zero multi-tenant sharing",
        "Custom AWS VPC peering & IAM integration",
        "SSO / SAML 2.0 authentication",
        "24/7 dedicated DevOps engineer support",
        "Custom compliance (SOC2, HIPAA)",
      ],
      cta: "Contact Architecture Team",
      highlighted: false,
      href: "/signup?plan=enterprise",
    },
  ]

  return (
    <section id="pricing" className="py-20 md:py-28 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            Transparent Scaling
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Predictable Pricing. No Surprise Bills.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Get started right now during our public beta. Upgrade as your workloads scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col justify-between relative transition-all duration-300 ${
                tier.highlighted
                  ? "border-primary bg-card/90 shadow-2xl shadow-primary/10 ring-1 ring-primary/40 -translate-y-2"
                  : "border-border bg-card/50 hover:border-border/80"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-[11px] font-bold text-white shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-foreground">{tier.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                    {tier.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-foreground">{tier.price}</span>
                  <span className="text-xs text-muted-foreground">/{tier.cadence}</span>
                </div>

                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  {tier.desc}
                </p>

                <div className="space-y-3 mb-8">
                  {tier.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href={tier.href}>
                <Button
                  className={`w-full font-semibold ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-md shadow-blue-500/20"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {tier.cta} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
