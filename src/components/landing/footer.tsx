import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-14 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crm-teal text-white shadow-sm font-black">
                F
              </div>
              <span>FWS <span className="text-crm-teal font-extrabold">CRM</span></span>
            </Link>
            <p className="max-w-sm text-xs text-slate-400 leading-relaxed">
              Enterprise customer relationship management platform engineered for streaming CSV ingestion, multi-tenant security, and pipeline clarity.
            </p>
            <div className="text-[11px] text-slate-400 pt-2">
              Powered by Neon PostgreSQL & Next.js
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pipeline" className="hover:text-white transition-colors">Sales Pipeline</a></li>
              <li><a href="#analytics" className="hover:text-white transition-colors">Analytics</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link href="/dashboard/leads" className="hover:text-white transition-colors">Leads Table</Link></li>
              <li><Link href="/dashboard/imports" className="hover:text-white transition-colors">CSV Ingestion</Link></li>
            </ul>
          </div>

          {/* Architecture & Security */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Architecture</h4>
            <ul className="space-y-2">
              <li><a href="#security" className="hover:text-white transition-colors">HttpOnly Cookies</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Multi-Tenant Isolation</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Role-Based Access</a></li>
              <li><span className="text-slate-400">PostgreSQL Relational DB</span></li>
              <li><span className="text-slate-400">Prisma Migrations</span></li>
            </ul>
          </div>

          {/* Access & Account */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Access</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Register Organization</Link></li>
              <li><Link href="/forgot-password" className="hover:text-white transition-colors">Password Reset</Link></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Platform FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>© {new Date().getFullYear()} FWS CRM. All rights reserved. Production Enterprise Edition.</div>
          <div className="flex gap-6">
            <span className="hover:text-slate-300">Privacy Policy</span>
            <span className="hover:text-slate-300">Terms of Service</span>
            <span className="hover:text-slate-300">Security Disclosure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
