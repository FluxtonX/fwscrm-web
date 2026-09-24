'use client';

import * as React from 'react';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t border-[#16454B] bg-[#071A1D] text-[#91B7BA] py-14 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16C1C8] text-[#071A1D] shadow-sm font-bold text-base">
                F
              </div>
              <span>FWS <span className="text-[#16C1C8] font-bold">CRM</span></span>
            </Link>
            <p className="max-w-sm text-xs text-slate-300 leading-relaxed font-normal">
              Enterprise customer relationship management platform engineered for high-velocity lead ingestion, pipeline clarity, and multi-tenant security.
            </p>
            <div className="text-[11px] text-[#91B7BA] pt-2 font-mono">
              Neon PostgreSQL • BullMQ Asynchronous Queues • Next.js
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Product</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#features" className="hover:text-[#22D3DA] transition-colors">Product Intelligence</a></li>
              <li><a href="#pipeline" className="hover:text-[#22D3DA] transition-colors">Sales Pipeline</a></li>
              <li><a href="#analytics" className="hover:text-[#22D3DA] transition-colors">Analytics</a></li>
              <li><a href="#workflow" className="hover:text-[#22D3DA] transition-colors">Automation</a></li>
              <li><a href="#leads" className="hover:text-[#22D3DA] transition-colors">Lead Management</a></li>
              <li><a href="#pricing" className="hover:text-[#22D3DA] transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Architecture & Security */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Trust</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#security" className="hover:text-[#22D3DA] transition-colors">Signed Session Cookies</a></li>
              <li><a href="#security" className="hover:text-[#22D3DA] transition-colors">Multi-Tenant Isolation</a></li>
              <li><a href="#security" className="hover:text-[#22D3DA] transition-colors">5-Tier RBAC</a></li>
              <li><span className="text-slate-300">Prisma Schema Integrity</span></li>
              <li><span className="text-slate-300">Streaming Deduplication</span></li>
            </ul>
          </div>

          {/* Access & Account */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Access</h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link href="/login" className="hover:text-[#22D3DA] transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-[#22D3DA] transition-colors">Get Started Free</Link></li>
              <li><Link href="/forgot-password" className="hover:text-[#22D3DA] transition-colors">Password Reset</Link></li>
              <li><a href="#faq" className="hover:text-[#22D3DA] transition-colors">Platform FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#16454B] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-300">
          <div>© {new Date().getFullYear()} FWS CRM. All rights reserved. Enterprise SaaS Edition.</div>
          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security Statement</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
