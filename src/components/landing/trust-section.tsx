import { Shield, Zap, Lock, Database } from 'lucide-react';

export function TrustSection() {
  return (
    <section className="border-y border-crm-border bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold tracking-wider text-crm-muted uppercase">
          Engineered for Reliability & Scale
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-crm-header sm:text-2xl">
          Built for teams that demand complete visibility across their customer journey
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Database className="h-6 w-6 text-sky-600 mb-2" />
            <span className="text-sm font-semibold text-crm-header">PostgreSQL Core</span>
            <span className="text-[11px] text-crm-muted text-center mt-0.5">ACID compliance & relational integrity</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Zap className="h-6 w-6 text-amber-500 mb-2" />
            <span className="text-sm font-semibold text-crm-header">Streaming Ingestion</span>
            <span className="text-[11px] text-crm-muted text-center mt-0.5">Zero event-loop blocking on bulk CSVs</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Lock className="h-6 w-6 text-emerald-600 mb-2" />
            <span className="text-sm font-semibold text-crm-header">Strict Multi-Tenancy</span>
            <span className="text-[11px] text-crm-muted text-center mt-0.5">Authoritative query-level isolation</span>
          </div>

          <div className="flex flex-col items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Shield className="h-6 w-6 text-crm-teal mb-2" />
            <span className="text-sm font-semibold text-crm-header">Role-Based Access</span>
            <span className="text-[11px] text-crm-muted text-center mt-0.5">Hierarchical granular permissions</span>
          </div>
        </div>
      </div>
    </section>
  );
}
