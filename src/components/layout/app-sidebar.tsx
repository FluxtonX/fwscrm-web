'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  UploadCloud,
  Activity,
  BarChart3,
  UserCheck,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Leads',
    href: '/dashboard/leads',
    icon: Users,
  },
  {
    label: 'Imports',
    href: '/dashboard/imports',
    icon: UploadCloud,
  },
  {
    label: 'Activities',
    href: '/dashboard/activities',
    icon: Activity,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    label: 'Team & Users',
    href: '/dashboard/users',
    icon: UserCheck,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-[#0A2428] text-slate-300 border-r border-[#0D2D32] flex flex-col justify-between select-none h-full overflow-y-auto sidebar-scroll">
      <div className="py-4 flex-1">
        <div className="px-4 mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          CRM Navigation
        </div>
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all duration-150',
                  isActive
                    ? 'bg-[#0D2D32] text-[#22D3DA] font-semibold shadow-sm border-l-2 border-[#16C1C8] pl-2.5'
                    : 'text-slate-300 hover:bg-[#0D2D32]/70 hover:text-white font-medium',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#16C1C8]' : 'text-slate-400')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#0D2D32] text-[11px] text-slate-400 shrink-0 space-y-0.5">
        <div className="font-semibold text-slate-300">FWS CRM v1.0</div>
        <div className="text-[10px] text-slate-400">Enterprise Edition</div>
      </div>
    </aside>
  );
}
