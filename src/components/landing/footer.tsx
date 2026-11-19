import * as React from "react"
import Link from "next/link"
import { Rocket, Github, Twitter, Disc as Discord, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-slate-950 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 text-white">
                <Rocket className="h-4 w-4" />
              </div>
              <span>
                BuildYourOwn <span className="text-blue-400">PaaS</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Open cloud application deployment platform. Automated BuildKit container construction, private registry distribution, and lightweight Kubernetes K3s orchestration.
            </p>
            <div className="flex items-center gap-3 text-slate-400 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Discord className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">Pipeline Workflow</Link></li>
              <li><Link href="#infrastructure" className="hover:text-white transition-colors">Kubernetes K3s</Link></li>
              <li><Link href="#architecture" className="hover:text-white transition-colors">Architecture</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Console Dashboard</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/projects/new" className="hover:text-white transition-colors">New Deployment</Link></li>
              <li><Link href="/deployments" className="hover:text-white transition-colors">Rollout History</Link></li>
              <li><Link href="/infrastructure" className="hover:text-white transition-colors">Cluster Status</Link></li>
              <li><Link href="/aws-connections" className="hover:text-white transition-colors">AWS Integration</Link></li>
              <li><Link href="/monitoring" className="hover:text-white transition-colors">Live Telemetry</Link></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">CLI Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Spec</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BuildYourOwn PaaS. Engineered for developers.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
