import * as React from "react"
import Link from "next/link"
import { UploadCloud, CheckCircle2, ArrowRight, FileArchive, FolderArchive, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ZipDeploySection() {
  return (
    <section className="py-20 md:py-28 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Showcase (Left) */}
          <div className="order-2 lg:order-1 rounded-2xl border-2 border-dashed border-border/90 bg-card/40 p-8 text-center relative group hover:border-primary/60 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="h-8 w-8" />
            </div>

            <h4 className="text-base font-semibold text-foreground mb-1">
              Drag and drop your project ZIP
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6">
              Archive your code folder (excluding node_modules or .git) and upload up to 50MB.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-mono text-muted-foreground shadow-sm">
              <FileArchive className="h-4 w-4 text-primary" />
              <span>ml-pipeline-v1.2.0.zip (14.2 MB)</span>
              <span className="text-emerald-400 font-semibold ml-2">Validated</span>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Auto-unzip
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Framework scan
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Dockerfile gen
              </span>
            </div>
          </div>

          {/* Description (Right) */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4">
              <FolderArchive className="h-3 w-3" /> No Git Required
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Prefer ZIP Deployments? Just Upload and Run.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Ideal for quick proof-of-concepts, proprietary codebases without public Git providers, data science notebooks, or automated CI/CD artifacts.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Client-side ZIP signature validation and payload sanitization",
                "Automatic Dockerfile synthesis if none is present in archive",
                "Direct ingestion into the BuildKit container construction engine",
                "Same Kubernetes K3s isolation and live ingress routing",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link href="/projects/new">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold">
                  Upload ZIP Archive <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
