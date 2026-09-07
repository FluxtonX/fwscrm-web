import {
  Users,
  Target,
  Briefcase,
  GitPullRequest,
  CheckSquare,
  ShieldCheck,
  BarChart3,
  Zap,
} from 'lucide-react';
import { FeatureCard } from './feature-card';

export function FeaturesSection() {
  const features = [
    {
      title: 'Contact Management',
      description: 'Centralized directory for customer and company records with authoritative attribution, tags, and country mapping.',
      icon: Users,
    },
    {
      title: 'Lead Lifecycle Management',
      description: 'Capture, qualify, assign, and convert prospects through structured status pipelines with zero data loss.',
      icon: Target,
    },
    {
      title: 'Deal & Opportunity Tracking',
      description: 'Track deals through custom stages with real-time value projections and stage duration insights.',
      icon: Briefcase,
    },
    {
      title: 'Visual Sales Pipeline',
      description: 'Intuitive pipeline management to monitor deal velocity, bottlenecks, and win rates across your sales team.',
      icon: GitPullRequest,
    },
    {
      title: 'Tasks & Team Activities',
      description: 'Log calls, notes, client touchpoints, and scheduled follow-ups with comprehensive chronological timelines.',
      icon: CheckSquare,
    },
    {
      title: 'Hierarchical Team RBAC',
      description: 'Enforce granular permissions across Super Admins, Managers, and Agents with query-level tenant isolation.',
      icon: ShieldCheck,
    },
    {
      title: 'Real-Time Analytics & Reports',
      description: 'Understand revenue performance, conversion velocities, and lead source efficacy powered by PostgreSQL aggregations.',
      icon: BarChart3,
    },
    {
      title: 'Streaming CSV Ingestion',
      description: 'Ingest massive CSV datasets with automated duplicate email detection, batch inserts, and row-level error reporting.',
      icon: Zap,
      badge: 'High Scale',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white border-y border-crm-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-crm-teal">
            Comprehensive Capabilities
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-crm-header sm:text-4xl">
            Everything your team needs to scale revenue
          </h2>
          <p className="mt-4 text-base text-crm-muted sm:text-lg">
            Purpose-built architecture combining intuitive daily sales workflows with resilient enterprise infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat) => (
            <FeatureCard
              key={feat.title}
              title={feat.title}
              description={feat.description}
              icon={feat.icon}
              badge={feat.badge}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
