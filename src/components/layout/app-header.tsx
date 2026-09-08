'use client';

import * as React from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { LogOut, Building2, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AppHeader() {
  const { user, organization, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between bg-[#071A1D] border-b border-[#0D2D32] px-4 text-white shadow-md select-none shrink-0">
      {/* Brand & Organization Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <span className="text-[#16C1C8] font-bold">FWS</span> CRM
        </div>

        {organization && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-[#0A2428] px-2.5 py-1 text-xs text-slate-200 border border-[#0D2D32]">
            <Building2 className="h-3.5 w-3.5 text-[#16C1C8]" />
            <span className="font-medium">{organization.name}</span>
          </div>
        )}
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{user.email}</span>
            </div>

            <Badge
              variant="default"
              className="bg-[#0A2428] text-[#22D3DA] border-[#0D2D32] text-[10px] px-2 py-0.5 font-medium tracking-wide"
            >
              {user.role}
            </Badge>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="flex items-center justify-center h-8 w-8 rounded-md text-slate-300 hover:bg-[#0D2D32] hover:text-[#22D3DA] transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <UserIcon className="h-4 w-4" />
            <span>Not authenticated</span>
          </div>
        )}
      </div>
    </header>
  );
}
