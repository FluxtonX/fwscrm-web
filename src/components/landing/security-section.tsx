import { Shield, KeyRound, Lock, FileCode, CheckCircle } from 'lucide-react';

export function SecuritySection() {
  const securityPillars = [
    {
      title: 'Signed HttpOnly Cookie Authentication',
      description: 'Tokens are never stored in localStorage or JavaScript-accessible browser memory, eliminating XSS token theft vectors entirely.',
      icon: KeyRound,
    },
    {
      title: 'Query-Level Multi-Tenant Isolation',
      description: 'Every database query strictly enforces the authoritative organization ID extracted directly from the verified cryptographic session.',
      icon: Lock,
    },
    {
      title: 'Hierarchical Role-Based Access (RBAC)',
      description: 'Fine-grained server-side guards protecting all routes across Super Admin, Admin, Manager, Agent, and Viewer tiers.',
      icon: Shield,
    },
    {
      title: 'SQL Injection Prevention & Data Integrity',
      description: 'Zero raw SQL string concatenation. Prisma ORM strictly parameterizes all database queries and schema validations.',
      icon: FileCode,
    },
  ];

  return (
    <section id="security" className="py-20 bg-white border-y border-crm-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-crm-teal">
            Enterprise Security
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-crm-header sm:text-4xl">
            Protection Engineered at Every Layer
          </h2>
          <p className="mt-4 text-base text-crm-muted sm:text-lg">
            Built with uncompromising data privacy, strict tenant isolation, and modern web application security standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex items-start gap-4 rounded-2xl border border-crm-border bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-crm-teal">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-crm-header">{pillar.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-crm-muted leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
