import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

export function FeatureCard({ title, description, icon: Icon, badge }: FeatureCardProps) {
  return (
    <div className="group relative rounded-2xl border border-crm-border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#16C1C8]/50 hover:shadow-[0_4px_20px_rgba(22,193,200,0.12)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16C1C8]/10 text-[#16C1C8] transition-colors group-hover:bg-[#16C1C8] group-hover:text-[#071A1D]">
          <Icon className="h-5 w-5" />
        </div>
        {badge && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold text-crm-header group-hover:text-[#16C1C8] transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-xs sm:text-sm text-crm-muted leading-relaxed font-normal">
        {description}
      </p>
    </div>
  );
}
