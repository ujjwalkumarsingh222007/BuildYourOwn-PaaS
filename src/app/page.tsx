import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { GithubDeploySection } from "@/components/landing/github-deploy-section"
import { ZipDeploySection } from "@/components/landing/zip-deploy-section"
import { ArchitectureOverviewSection } from "@/components/landing/architecture-section"
import { InfrastructureSection } from "@/components/landing/infrastructure-section"
import { MonitoringSection } from "@/components/landing/monitoring-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <GithubDeploySection />
        <ZipDeploySection />
        <ArchitectureOverviewSection />
        <InfrastructureSection />
        <MonitoringSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
