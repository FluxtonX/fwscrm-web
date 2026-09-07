import { FileSpreadsheet, Database, ArrowRight, Clock, Webhook, CloudUpload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function IntegrationsSection() {
  const plannedIntegrations = [
    { name: 'REST Webhooks API', status: 'Coming Soon', desc: 'Trigger real-time lead ingestion from marketing landing pages.' },
    { name: 'Cloud Object Storage', status: 'Coming Soon', desc: 'Direct ingestion from Cloudflare R2 / AWS S3 buckets.' },
    { name: 'Lead Distribution Feeds', status: 'Coming Soon', desc: 'Automated syndicated lead routing across affiliate networks.' },
  ];

  return (
    <section className="py-20 bg-crm-background border-b border-crm-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-crm-teal">
            Ingestion & Ecosystem
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-crm-header sm:text-4xl">
            Streamlined Ingestion Engine
          </h2>
          <p className="mt-4 text-base text-crm-muted sm:text-lg">
            High-performance streaming engine built for massive lead files, with extensible enterprise connectors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Production Engine */}
          <div className="lg:col-span-2 rounded-2xl border border-teal-300 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-crm-teal">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <Badge variant="teal">Production Ready</Badge>
              </div>

              <h3 className="text-xl font-bold text-crm-header">High-Volume Streaming CSV Ingestion</h3>
              <p className="mt-2 text-sm text-crm-muted">
                Our streaming parser processes multi-thousand row files in real-time batches without memory leaks. Includes row-level validation and instant deduplication against your tenant database.
              </p>

              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-bold text-slate-700 mb-2">Native Supported Schema:</div>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-600">
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">First Name</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">Last Name</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">Email</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">Phone</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">Country</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">Lead Source</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">referrer</span>
                  <span className="rounded bg-white px-2 py-0.5 border border-slate-200">tag1</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-crm-teal font-semibold">
              <span>Automatic duplicate email detection included</span>
              <CloudUpload className="h-4 w-4" />
            </div>
          </div>

          {/* Coming Soon Connectors */}
          <div className="rounded-2xl border border-crm-border bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Webhook className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                  Roadmap
                </span>
              </div>

              <h3 className="text-lg font-bold text-crm-header">Upcoming Connectors</h3>
              <p className="mt-1 text-xs text-crm-muted mb-4">
                Native integrations actively in development for the next platform release.
              </p>

              <div className="space-y-3">
                {plannedIntegrations.map((item) => (
                  <div key={item.name} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">{item.name}</span>
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Zero fake logos. Clear development roadmap.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
