/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn, formatCurrency, formatNumber } from '../lib/utils';
import { motion } from 'motion/react';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle: string;
  isProfit?: boolean;
  isNumber?: boolean;
  unit?: string;
  delay: number;
}

export function SummaryCard({ title, value, icon, subtitle, isProfit, isNumber, unit, delay }: SummaryCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass card-hover rounded-3xl p-6 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-slate-50 rounded-xl">
          {icon}
        </div>
        <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
          Realtime
        </div>
      </div>
      
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h2 className={cn(
            "text-2xl font-bold tracking-tight",
            isProfit === true ? "text-emerald-600" : isProfit === false ? "text-rose-600" : "text-slate-900"
          )}>
            {isNumber ? formatNumber(value) : formatCurrency(value)}
          </h2>
          {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">{subtitle}</p>
      </div>

      {/* Background Decor */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
        {icon}
      </div>
    </motion.div>
  );
}
