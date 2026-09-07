import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

export function FeatureCard({ title, description, icon: Icon, badge }: FeatureCardProps) {
  return (
    <div className="group relative rounded-2xl border border-crm-border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-teal-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-crm-teal transition-colors group-hover:bg-crm-teal group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        {badge && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-base font-bold text-crm-header group-hover:text-crm-teal transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-xs sm:text-sm text-crm-muted leading-relaxed">
        {description}
      </p>
    </div>
  );
}
