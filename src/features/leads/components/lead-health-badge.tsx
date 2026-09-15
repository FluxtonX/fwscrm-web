'use client';

import * as React from 'react';
import { Flame, Sun, AlertTriangle, Clock } from 'lucide-react';
import { Lead } from '../types';
import { computeLeadHealth } from '../utils/lead-health';

interface LeadHealthBadgeProps {
  lead: Lead;
  compact?: boolean;
}

export function LeadHealthBadge({ lead, compact = false }: LeadHealthBadgeProps) {
  const health = computeLeadHealth(lead);

  const renderIcon = () => {
    switch (health.iconType) {
      case 'flame':
        return <Flame className="h-3 w-3 text-rose-500 fill-rose-500/20" />;
      case 'sun':
        return <Sun className="h-3 w-3 text-amber-500" />;
      case 'alert':
        return <AlertTriangle className="h-3 w-3 text-rose-600" />;
      case 'clock':
        return <Clock className="h-3 w-3 text-slate-400" />;
    }
  };

  if (compact) {
    return (
      <span
        title={`Health: ${health.label} — ${health.reason}`}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${health.badgeBg} ${health.badgeText} ${health.badgeBorder}`}
      >
        {renderIcon()}
        <span>{health.label}</span>
      </span>
    );
  }

  return (
    <span
      title={health.reason}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${health.badgeBg} ${health.badgeText} ${health.badgeBorder}`}
    >
      {renderIcon()}
      <span>{health.label}</span>
    </span>
  );
}
