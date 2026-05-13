/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Database } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

function NavItem({ to, icon, label, description }: NavItemProps) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-4 py-2 rounded-xl transition-all",
        isActive 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <div className="shrink-0">{icon}</div>
      <div className="hidden sm:block text-left">
        <p className="text-xs font-bold leading-none mb-0.5">{label}</p>
        <p className={cn(
          "text-[8px] opacity-70 leading-none",
          "uppercase tracking-tighter"
        )}>{description}</p>
      </div>
    </NavLink>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full glass shadow-sm px-6 py-4 mb-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Family Portfolio</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">全家資產監控儀表板</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <NavItem 
            to="/csv" 
            icon={<FileText size={18} />} 
            label="CSV 版本" 
            description="Manual Upload" 
          />
          <NavItem 
            to="/sheets" 
            icon={<Database size={18} />} 
            label="Sheets 版本" 
            description="Auto Sync" 
          />
        </nav>
      </div>
    </header>
  );
}
