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
    <aside className="w-56 shrink-0 bg-crm-sidebar text-slate-300 border-r border-slate-800 flex flex-col justify-between select-none h-full overflow-y-auto sidebar-scroll">
      <div className="py-4 flex-1">
        <div className="px-4 mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                  'flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-crm-sidebar-active text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-crm-sidebar-hover hover:text-white',
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 shrink-0">
        <div>FWS CRM v1.0</div>
        <div className="text-[10px] text-slate-400">Production Edition</div>
      </div>
    </aside>
  );
}
