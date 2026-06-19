/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  PieChart, 
  BarChart2,
  ArrowRightLeft,
  Building2,
  User,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import { PortfolioItem } from '../types';
import { cn, formatCurrency, formatNumber, formatWan } from '../lib/utils';
import { SummaryCard } from './SummaryCard';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const GROUP_CONFIG: Record<string, {
  title: string;
  color: string;
  textColor: string;
  badgeBg: string;
  activeClass: string;
  bgClass: string;
  icon: string;
}> = {
  'A': {
    title: 'A. 現金與虛擬貨幣類 (Cash & Crypto)',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-500 text-white',
    activeClass: 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700 shadow-xs ring-2 ring-emerald-500/20 scale-[1.02] font-semibold',
    bgClass: 'bg-emerald-50/5 border border-emerald-100/50',
    icon: '💵',
  },
  'B': {
    title: 'B. 股票與 ETF 投資類 (Stocks & ETFs)',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-500 text-white',
    activeClass: 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 shadow-xs ring-2 ring-indigo-500/20 scale-[1.02] font-semibold',
    bgClass: 'bg-indigo-50/5 border border-indigo-100/50',
    icon: '📈',
  },
  'C': {
    title: 'C. 期貨與保證金類 (Futures & Margin)',
    color: 'bg-pink-500',
    textColor: 'text-pink-650',
    badgeBg: 'bg-pink-500 text-white',
    activeClass: 'bg-pink-600 border-pink-600 text-white shadow-pink-100 hover:bg-pink-700 shadow-xs ring-2 ring-pink-500/20 scale-[1.02] font-semibold',
    bgClass: 'bg-pink-50/5 border border-pink-100/50',
    icon: '⚡',
  },
  'D': {
    title: 'D. 保險與儲蓄險類 (Insurance & Savings)',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-600',
    badgeBg: 'bg-cyan-500 text-white',
    activeClass: 'bg-cyan-600 border-cyan-600 text-white shadow-cyan-100 hover:bg-cyan-700 shadow-xs ring-2 ring-cyan-500/20 scale-[1.02] font-semibold',
    bgClass: 'bg-cyan-50/5 border border-cyan-100/50',
    icon: '🛡️',
  },
  'E': {
    title: 'E. 不動產與退休金類 (Properties & Pensions)',
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    badgeBg: 'bg-amber-600 text-white',
    activeClass: 'bg-amber-600 border-amber-600 text-white shadow-amber-100 hover:bg-amber-700 shadow-xs ring-2 ring-amber-500/20 scale-[1.02] font-semibold',
    bgClass: 'bg-amber-50/5 border border-amber-100/50',
    icon: '🏠',
  },
  'F': {
    title: 'F. 借貸與負債類 (Loans & Liabilities)',
    color: 'bg-rose-500',
    textColor: 'text-rose-500',
    badgeBg: 'bg-rose-500 text-white',
    activeClass: 'bg-rose-600 border-rose-600 text-white shadow-rose-100 hover:bg-rose-700 shadow-xs ring-2 ring-rose-500/20 scale-[1.02] font-semibold',
    bgClass: 'bg-rose-50/5 border border-rose-100/50',
    icon: '💸',
  },
  'OTHER': {
    title: '其他自訂資產類 (Other Assets)',
    color: 'bg-slate-500',
    textColor: 'text-slate-600',
    badgeBg: 'bg-slate-500 text-white',
    activeClass: 'bg-slate-700 border-slate-700 text-white shadow-slate-100 hover:bg-slate-800 shadow-xs ring-2 ring-slate-500/20 scale-[1.02] font-semibold',
    bgClass: 'bg-slate-50/10 border border-slate-200',
    icon: '📁',
  }
};

const getMarketConfig = (market: string) => {
  const m = market.toUpperCase();
  if (m === 'TW') return { label: '台灣市場 (TW)', color: 'bg-rose-500', textColor: 'text-rose-600' };
  if (m === 'US') return { label: '美國市場 (US)', color: 'bg-blue-500', textColor: 'text-blue-600' };
  if (m === 'GLOBAL') return { label: '全球市場 (Global)', color: 'bg-cyan-500', textColor: 'text-cyan-600' };
  if (m === 'CASH') return { label: '現金部位 (Cash)', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
  return { label: market, color: 'bg-slate-400', textColor: 'text-slate-500' };
};

interface DashboardContentProps {
  data: PortfolioItem[];
  ownerFilter: string | 'All';
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  ownersList: string[];
}

export function DashboardContent({ 
  data, 
  ownerFilter, 
  searchTerm, 
  setSearchTerm,
  ownersList 
}: DashboardContentProps) {
  const [expandedSymbols, setExpandedSymbols] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'value' | 'exposure' | 'original'>('value');
  const [excludedTypes, setExcludedTypes] = useState<Set<string>>(new Set());
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);
  const [dataSignature, setDataSignature] = useState<string>('');

  // Helper mapping for units
  const getUnit = (subcat?: string, type?: string) => {
    if (!subcat) {
      if (type?.includes('股') || type?.includes('ETF')) return '股';
      if (type?.includes('期貨') || type?.includes('合約')) return '口';
      return '元';
    }
    const cat = subcat.toUpperCase();
    if (cat.startsWith('B')) return '股';
    if (cat === 'C2') return '口';
    return '元';
  };

  // Get all unique types present in the imported data
  const allTypes = useMemo(() => {
    const types = Array.from(new Set(data.map(item => item.type).filter(Boolean)));
    return types;
  }, [data]);

  const activeTypes = useMemo(() => {
    return allTypes.filter(t => !excludedTypes.has(t));
  }, [allTypes, excludedTypes]);

  // Get the subcat assigned to each type
  const typeToSubcat = useMemo(() => {
    const mapping: Record<string, string> = {};
    data.forEach(item => {
      if (item.type && item.subcat) {
        mapping[item.type] = item.subcat.toUpperCase();
      }
    });
    return mapping;
  }, [data]);

  // Set default exclusions: exclude D and E categories on first load or when data types change
  useEffect(() => {
    const sortedTypesString = [...allTypes].sort().join(',');
    if (sortedTypesString && sortedTypesString !== dataSignature) {
      const defaultExcluded = new Set<string>();
      allTypes.forEach(type => {
        const sub = typeToSubcat[type] || '';
        const firstChar = sub.charAt(0).toUpperCase();
        if (firstChar === 'D' || firstChar === 'E') {
          defaultExcluded.add(type);
        }
      });
      setExcludedTypes(defaultExcluded);
      setDataSignature(sortedTypesString);
    }
  }, [allTypes, typeToSubcat, dataSignature]);

  // Group all types by their subcat first character
  const groupedTypes = useMemo(() => {
    const groups: Record<string, string[]> = {};
    
    allTypes.forEach(type => {
      const sub = typeToSubcat[type] || '';
      const firstChar = sub.charAt(0).toUpperCase();
      const groupKey = GROUP_CONFIG[firstChar] ? firstChar : 'OTHER';
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(type);
    });

    // Return sorted keys from GROUP_CONFIG that have types
    return Object.keys(GROUP_CONFIG)
      .filter(key => groups[key] && groups[key].length > 0)
      .map(key => ({
        key,
        config: GROUP_CONFIG[key],
        types: groups[key]
      }));
  }, [allTypes, typeToSubcat]);

  // Toggle single type helper
  const toggleType = (type: string) => {
    setExcludedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Toggle group selection helper
  const toggleGroupSelection = (typesInGroup: string[], active: boolean) => {
    setExcludedTypes(prev => {
      const next = new Set(prev);
      typesInGroup.forEach(type => {
        if (active) {
          next.delete(type); // Removing from excluded means activating it
        } else {
          next.add(type);    // Adding to excluded means deactivating it
        }
      });
      return next;
    });
  };

  // 1. Get data filtered by owner (if selected)
  const ownerFilteredData = useMemo(() => {
    return ownerFilter === 'All' 
      ? data 
      : data.filter(item => item.owner === ownerFilter);
  }, [data, ownerFilter]);

  // 1b. Filtered by active types
  const typeFilteredData = useMemo(() => {
    return ownerFilteredData.filter(item => !excludedTypes.has(item.type));
  }, [ownerFilteredData, excludedTypes]);

  // 2. Calculations
  const totals = useMemo(() => {
    return typeFilteredData.reduce((acc, item) => {
      const sub = String(item.subcat || '').toUpperCase();
      const isA = sub.startsWith('A');
      const isD = sub.startsWith('D');
      const isF = sub.startsWith('F');
      return {
        value: acc.value + item.value,
        exposure: acc.exposure + item.exposure,
        change: acc.change + item.change,
        catA: acc.catA + (isA ? item.value : 0),
        catD: acc.catD + (isD ? item.value : 0),
        catF: acc.catF + (isF ? item.value : 0)
      };
    }, { value: 0, exposure: 0, change: 0, catA: 0, catD: 0, catF: 0 });
  }, [typeFilteredData]);

  const ownersData = useMemo(() => {
    return ownersList.map(owner => {
      const items = data.filter(item => item.owner === owner && !excludedTypes.has(item.type));
      return {
        name: owner,
        value: items.reduce((sum, item) => sum + item.value, 0),
        exposure: items.reduce((sum, item) => sum + item.exposure, 0),
        change: items.reduce((sum, item) => sum + item.change, 0),
        catA: items.reduce((sum, item) => sum + (String(item.subcat || '').toUpperCase().startsWith('A') ? item.value : 0), 0),
        catD: items.reduce((sum, item) => sum + (String(item.subcat || '').toUpperCase().startsWith('D') ? item.value : 0), 0),
        catF: items.reduce((sum, item) => sum + (String(item.subcat || '').toUpperCase().startsWith('F') ? item.value : 0), 0)
      };
    });
  }, [data, ownersList, excludedTypes]);

  const bankData = useMemo(() => {
    const banks = Array.from(new Set(typeFilteredData.map(item => item.bank)));
    return banks.map(bank => {
      const items = typeFilteredData.filter(item => item.bank === bank);
      return {
        name: bank,
        value: items.reduce((sum, item) => sum + item.value, 0),
        market: items[0]?.market || 'TW'
      };
    });
  }, [typeFilteredData]);

  const typeCalculations = useMemo(() => {
    return activeTypes.map(t => {
      const items = typeFilteredData.filter(item => item.type === t);
      return {
        name: t,
        value: items.reduce((sum, item) => sum + item.value, 0),
        exposure: items.reduce((sum, item) => sum + item.exposure, 0),
        change: items.reduce((sum, item) => sum + item.change, 0),
      };
    }).sort((a, b) => b.value - a.value);
  }, [activeTypes, typeFilteredData]);

  const marketCalculations = useMemo(() => {
    const marketMap: Record<string, number> = {};
    typeFilteredData.forEach(item => {
      const m = item.market || 'OTHER';
      marketMap[m] = (marketMap[m] || 0) + item.change;
    });
    return Object.entries(marketMap)
      .map(([name, change]) => ({ name, change }))
      .sort((a, b) => b.change - a.change);
  }, [typeFilteredData]);

  const chartData = useMemo(() => {
    return typeCalculations.filter(tc => tc.value !== 0);
  }, [typeCalculations]);

  const filteredTableData = useMemo(() => {
    return typeFilteredData.filter(item => {
      return item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
             item.bank.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [typeFilteredData, searchTerm]);

  const groupedTableData = useMemo(() => {
    const groups: Record<string, {
      items: PortfolioItem[];
      totalShare: number;
      totalValue: number;
      totalExposure: number;
      totalChange: number;
      type: string;
      market: string;
      price: number;
      subcat?: string;
      originalIndex: number;
    }> = {};

    filteredTableData.forEach((item, idx) => {
      if (!groups[item.id]) {
        const resolvedIndex = data.findIndex(d => d.id === item.id);
        groups[item.id] = {
          items: [],
          totalShare: 0,
          totalValue: 0,
          totalExposure: 0,
          totalChange: 0,
          type: item.type,
          market: item.market,
          price: item.price,
          subcat: item.subcat,
          originalIndex: resolvedIndex >= 0 ? resolvedIndex : idx
        };
      }
      groups[item.id].items.push(item);
      groups[item.id].totalShare += item.share;
      groups[item.id].totalValue += item.value;
      groups[item.id].totalExposure += item.exposure;
      groups[item.id].totalChange += item.change;
    });

    const result = Object.entries(groups).map(([symbol, data]) => ({
      symbol,
      ...data
    }));

    if (sortBy === 'original') {
      return result.sort((a, b) => a.originalIndex - b.originalIndex);
    } else if (sortBy === 'exposure') {
      return result.sort((a, b) => b.totalExposure - a.totalExposure);
    } else {
      return result.sort((a, b) => b.totalValue - a.totalValue);
    }
  }, [filteredTableData, sortBy, data]);

  const toggleSymbol = (symbol: string) => {
    const newSet = new Set(expandedSymbols);
    if (newSet.has(symbol)) {
      newSet.delete(symbol);
    } else {
      newSet.add(symbol);
    }
    setExpandedSymbols(newSet);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 space-y-8">
      {/* Category Filter Switches */}
      <div className="glass rounded-3xl p-6 bg-white border border-slate-100 shadow-xs">
        <div 
          onClick={() => setIsFilterExpanded(!isFilterExpanded)} 
          className="flex items-center justify-between gap-4 cursor-pointer select-none group"
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded bg-indigo-650 block group-hover:scale-y-110 transition-transform"></span>
              資產類別篩選 (Asset Filtration Controls)
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50 shrink-0 select-none">
                已啟用 {allTypes.length - excludedTypes.size} / {allTypes.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              依照第一個英文字母自動歸類，動態勾選項目以重新計算所有的資產市值與比例
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-slate-400 group-hover:text-indigo-600 transition-colors bg-slate-50 group-hover:bg-indigo-50/50 px-3 py-1.5 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-extrabold tracking-tight">
              {isFilterExpanded ? '收合篩選' : '展開篩選'}
            </span>
            {isFilterExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
        
        <AnimatePresence initial={false}>
          {isFilterExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-5 mt-4 border-t border-slate-100 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-500">
                      快速篩選選項
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setExcludedTypes(new Set())}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-2xs hover:scale-102 cursor-pointer"
                    >
                      顯示全部
                    </button>
                    <button
                      onClick={() => setExcludedTypes(new Set(allTypes))}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-2xs hover:scale-102 cursor-pointer"
                    >
                      隱藏全部
                    </button>
                  </div>
                </div>

                {/* Grouped asset classes grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 border-t border-slate-50">
                  {groupedTypes.map(group => {
                    const activeCount = group.types.filter(t => !excludedTypes.has(t)).length;
                    const isAllInactive = activeCount === 0;

                    return (
                      <div 
                        key={group.key}
                        className={cn(
                          "rounded-2xl p-4 border transition-all duration-200 space-y-3.5 flex flex-col justify-start",
                          isAllInactive 
                            ? "bg-slate-50/40 border-slate-100 opacity-70" 
                            : group.config.bgClass
                        )}
                      >
                        {/* Group Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100/50">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base select-none">{group.config.icon}</span>
                            <h4 className="text-xs font-extrabold text-slate-800 tracking-tight truncate">
                              {group.config.title}
                            </h4>
                          </div>
                          {/* Small check/uncheck helpers */}
                          <div className="flex items-center gap-1.5 shrink-0 select-none">
                            <button
                              onClick={() => toggleGroupSelection(group.types, true)}
                              className="text-[10px] font-bold tracking-tight text-indigo-500 hover:text-indigo-700 transition cursor-pointer"
                              title="全選此類"
                            >
                              全選
                            </button>
                            <span className="text-[9px] text-slate-300">|</span>
                            <button
                              onClick={() => toggleGroupSelection(group.types, false)}
                              className="text-[10px] font-bold tracking-tight text-slate-400 hover:text-slate-600 transition cursor-pointer"
                              title="全關此類"
                            >
                              全關
                            </button>
                          </div>
                        </div>

                        {/* Sub-categories (types) in group */}
                        <div className="flex flex-col gap-2">
                          {group.types.map(type => {
                            const isActive = !excludedTypes.has(type);
                            const sub = typeToSubcat[type] || '';
                            return (
                              <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className={cn(
                                  "px-3 py-2 rounded-xl text-xs font-extrabold border transition-all duration-200 flex items-center justify-between gap-3 shadow-2xs cursor-pointer select-none",
                                  isActive 
                                    ? group.config.activeClass
                                    : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:opacity-85 opacity-60 line-through decoration-slate-300 scale-[0.98]"
                                )}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className={cn(
                                    "text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-black shrink-0",
                                    isActive ? "bg-white/25 text-white" : "bg-slate-200 text-slate-500"
                                  )}>
                                    {sub || '??'}
                                  </span>
                                  <span className="truncate">{type}</span>
                                </div>
                                
                                {/* Status Switch Indicator Dot */}
                                <div className={cn(
                                  "w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all shrink-0",
                                  isActive ? "bg-white border-transparent" : "bg-slate-200 border-slate-300"
                                )}>
                                  {isActive && (
                                    <div className={cn("w-1.5 h-1.5 rounded-full", group.config.color)} />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="總資產 (Total Value)" 
          value={totals.value} 
          icon={<Wallet className="text-indigo-650" />}
          subtitle="包含選定種類資產、房產及資金"
          delay={0.1}
        >
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 select-none scrollbar-thin">
            {typeCalculations
              .filter(tc => tc.value !== 0)
              .sort((a, b) => {
                const subA = String(typeToSubcat[a.name] || '').toUpperCase();
                const subB = String(typeToSubcat[b.name] || '').toUpperCase();
                return subA.localeCompare(subB);
              })
              .map((tc) => {
                const sub = typeToSubcat[tc.name] || '';
                const firstChar = sub.charAt(0).toUpperCase();
                const groupConfig = GROUP_CONFIG[firstChar] || GROUP_CONFIG.OTHER;
                return (
                  <div key={tc.name} className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", groupConfig.color)} />
                      <span className="text-slate-500 font-bold truncate">{tc.name}</span>
                    </div>
                    <span className={cn("font-extrabold", groupConfig.textColor)}>
                      {formatCurrency(tc.value)}
                    </span>
                  </div>
                );
              })}
          </div>
        </SummaryCard>
        <SummaryCard 
          title="總曝險 (Exposure)" 
          value={totals.exposure} 
          icon={<ShieldCheck className="text-pink-600" />}
          subtitle="包含期期保證金及合約價值"
          delay={0.2}
        >
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 select-none scrollbar-thin">
            {typeCalculations
              .filter(tc => tc.exposure !== 0)
              .sort((a, b) => {
                const subA = String(typeToSubcat[a.name] || '').toUpperCase();
                const subB = String(typeToSubcat[b.name] || '').toUpperCase();
                return subA.localeCompare(subB);
              })
              .map((tc) => {
                const sub = typeToSubcat[tc.name] || '';
                const firstChar = sub.charAt(0).toUpperCase();
                const groupConfig = GROUP_CONFIG[firstChar] || GROUP_CONFIG.OTHER;
                return (
                  <div key={tc.name} className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", groupConfig.color)} />
                      <span className="text-slate-500 font-bold truncate">{tc.name}</span>
                    </div>
                    <span className={cn("font-extrabold", groupConfig.textColor)}>
                      {formatCurrency(tc.exposure)}
                    </span>
                  </div>
                );
              })}
          </div>
        </SummaryCard>
        <SummaryCard 
          title="今日損益 (Change)" 
          value={totals.change} 
          icon={totals.change >= 0 ? <TrendingUp className="text-emerald-600" /> : <TrendingDown className="text-rose-600" />}
          isProfit={totals.change >= 0}
          subtitle="與前一日市值損益變動比較"
          delay={0.3}
        >
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 select-none scrollbar-thin">
            {marketCalculations.filter(mc => mc.change !== 0).map((mc) => {
              const config = getMarketConfig(mc.name);
              const isProfit = mc.change >= 0;
              const textColor = isProfit ? 'text-emerald-600' : 'text-rose-600';
              return (
                <div key={mc.name} className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.color)} />
                    <span className="text-slate-500 font-bold truncate">{config.label}</span>
                  </div>
                  <span className={cn("font-extrabold flex items-center gap-0.5", textColor)}>
                    <span className="text-[8px]">{isProfit ? '▲' : '▼'}</span>
                    <span>{isProfit ? '+' : ''}{formatCurrency(mc.change)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </SummaryCard>
        <SummaryCard 
          title="流動資金" 
          value={totals.catA + totals.catD + totals.catF} 
          icon={<Wallet className="text-emerald-600" />}
          subtitle="包含 A、D、F 類之現金/保險/負債項目"
          delay={0.4}
        >
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 select-none scrollbar-thin">
            {typeCalculations
              .filter(tc => {
                const sub = String(typeToSubcat[tc.name] || '').toUpperCase();
                return (sub.startsWith('A') || sub.startsWith('D') || sub.startsWith('F')) && tc.value !== 0;
              })
              .sort((a, b) => {
                const subA = String(typeToSubcat[a.name] || '').toUpperCase();
                const subB = String(typeToSubcat[b.name] || '').toUpperCase();
                return subA.localeCompare(subB);
              })
              .map((tc) => {
                const sub = typeToSubcat[tc.name] || '';
                const firstChar = sub.charAt(0).toUpperCase();
                const groupConfig = GROUP_CONFIG[firstChar] || GROUP_CONFIG.OTHER;
                return (
                  <div key={tc.name} className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", groupConfig.color)} />
                      <span className="text-slate-500 font-bold truncate">{tc.name}</span>
                    </div>
                    <span className={cn("font-extrabold", groupConfig.textColor)}>
                      {formatCurrency(tc.value)}
                    </span>
                  </div>
                );
              })}
          </div>
        </SummaryCard>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl p-8 overflow-hidden">
          {ownerFilter === 'All' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User size={20} className="text-indigo-600" />
                  各人資產分配
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {ownersData.map((owner, idx) => (
                  <motion.div 
                    key={owner.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                  >
                    <p className="text-sm font-medium text-slate-500 mb-1">{owner.name}</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-400">市值</p>
                        <p className="font-bold text-indigo-600">{formatWan(owner.value)}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-slate-400">曝險</p>
                          <p className="font-semibold text-slate-600">{formatWan(owner.exposure)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">流動資金</p>
                          <p className="font-semibold text-amber-600">{formatWan(owner.catA + owner.catD + owner.catF)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BarChart2 size={14} /> 各人資產佔比
                  </h4>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={ownersData} 
                        layout="vertical" 
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          width={60}
                          tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                        />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(val: number) => [formatWan(val), '市值']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                          {ownersData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Building2 size={14} /> 全家資產分類佔比
                  </h4>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: number) => formatWan(val)} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {chartData.map((m, idx) => (
                      <div key={m.name} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="font-medium text-slate-600">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-700">{formatWan(m.value)}</span>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {totals.value > 0 ? ((m.value / totals.value) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-900">
                <PieChart size={20} className="text-pink-600" />
                {ownerFilter} 的資產種類分佈
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatWan(val)} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {chartData.map((m, idx) => (
                    <div key={m.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="font-bold text-slate-700">{m.name}</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-600">
                          {totals.value > 0 ? ((m.value / totals.value) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">市值 (Value)</p>
                          <p className="text-sm font-bold">{formatWan(m.value)}</p>
                        </div>
                        <div className="text-right text-slate-500">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">曝險 (Exposure)</p>
                          <p className="text-xs font-semibold">{formatWan(m.exposure)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="glass rounded-3xl p-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Building2 size={20} className="text-indigo-600" />
            券商帳戶(對帳用)
          </h3>
          <div className="space-y-4">
            {[...bankData].sort((a, b) => b.value - a.value).map((bank) => (
              <div key={bank.name} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold",
                    bank.market === 'TW' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {bank.market}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{bank.name}</p>
                    <p className="text-[10px] text-slate-400">{bank.market === 'TW' ? '台灣市場' : '海外市場'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">{formatWan(bank.value)}</p>
                  <p className="text-[10px] text-slate-400">Total Value</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-3xl p-8 overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900">
            <ArrowRightLeft size={20} className="text-indigo-600" />
            持股明細
          </h3>
          <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-3">
            {/* Sorting Buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                id="sort-by-value-btn"
                onClick={() => setSortBy('value')}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                  sortBy === 'value' 
                    ? "bg-white text-indigo-600 shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                按市值排序
              </button>
              <button
                id="sort-by-exposure-btn"
                onClick={() => setSortBy('exposure')}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                  sortBy === 'exposure' 
                    ? "bg-white text-indigo-600 shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                按曝險排序
              </button>
              <button
                id="sort-by-original-btn"
                onClick={() => setSortBy('original')}
                className={cn(
                  "flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                  sortBy === 'original' 
                    ? "bg-white text-indigo-600 shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                原始排序 (Sheets)
              </button>
            </div>

            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                id="portfolio-search-input"
                type="text" 
                placeholder="搜尋 代號 或 券商..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-4 py-3">持有者 / 代號</th>
              <th className="px-4 py-3">股數 / 單位</th>
              <th className="px-4 py-3">現價</th>
              <th className="px-4 py-3 text-right">今日變動</th>
              <th className="px-4 py-3 text-right">市值 (TWD)</th>
              <th className="px-4 py-3 text-right">曝險 (TWD)</th>
              <th className="px-4 py-3">券商 / 市場</th>
            </tr>
          </thead>
          <tbody>
            {groupedTableData.map((group, groupIdx) => {
              const isExpanded = expandedSymbols.has(group.symbol);
              const hasMultiple = group.items.length > 1;
              const firstItem = group.items[0];
              const allSameBank = group.items.every(item => item.bank === firstItem.bank);
              const allSameMarket = group.items.every(item => item.market === firstItem.market);

              return (
                <React.Fragment key={group.symbol}>
                  {/* Summary Row */}
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: groupIdx * 0.05 }}
                    onClick={() => hasMultiple && toggleSymbol(group.symbol)}
                    className={cn(
                      "group transition-colors",
                      hasMultiple ? "cursor-pointer" : "cursor-default",
                      isExpanded ? "bg-indigo-50/30" : "bg-white hover:bg-slate-50"
                    )}
                  >
                    <td className="px-4 py-4 rounded-l-2xl border-y border-l border-slate-100">
                      <div className="flex items-center gap-3">
                        {hasMultiple ? (
                          <div className="p-1 rounded-lg bg-slate-100 text-slate-400 group-hover:text-indigo-600 transition-colors">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                        ) : (
                          <div className={cn(
                            "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold",
                            ownerFilter === firstItem.owner ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                          )}>
                            {firstItem.owner}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800">{group.symbol}</p>
                          {hasMultiple && (
                            <p className="text-[10px] text-slate-400 capitalize">
                              {(group.subcat === 'A1' || group.type === '自由現金')
                                ? `${group.items.length} 個帳戶` 
                                : (group.subcat === 'F1' || group.type === '股票質押')
                                ? `${group.items.length} 筆質押` 
                                : `${group.items.length} 筆持有`}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-y border-slate-100">
                      <p className="text-sm font-semibold">
                        {formatNumber(group.totalShare)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {getUnit(group.subcat, group.type)}
                      </p>
                    </td>
                    <td className="px-4 py-4 border-y border-slate-100">
                      <p className="text-sm font-mono">{group.price}</p>
                      <p className="text-[10px] text-slate-400">{allSameMarket ? group.market : ""}</p>
                    </td>
                    <td className="px-4 py-4 border-y border-slate-100 text-right">
                      <div className={cn(
                        "inline-flex items-center gap-0.5 text-xs font-bold",
                        group.totalChange >= 0 ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {group.totalChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {formatCurrency(group.totalChange)}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-y border-slate-100 text-right">
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(group.totalValue)}</p>
                    </td>
                    <td className="px-4 py-4 border-y border-slate-100 text-right">
                      <p className="text-sm font-semibold text-slate-600">{formatCurrency(group.totalExposure)}</p>
                    </td>
                    <td className="px-4 py-4 border-y border-r border-slate-100 rounded-r-2xl">
                      <p className="text-xs font-medium text-slate-700">
                        {allSameBank ? firstItem.bank : ""}
                      </p>
                      {allSameMarket && (
                        <div className="flex gap-1 mt-1">
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{firstItem.market}</span>
                        </div>
                      )}
                    </td>
                  </motion.tr>

                  {/* Detailed Rows (Only if multiple) */}
                  <AnimatePresence>
                    {hasMultiple && isExpanded && group.items.map((item, itemIdx) => (
                      <motion.tr 
                        key={`${item.id}-${item.owner}-${item.bank}-${itemIdx}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50/50"
                      >
                        <td className="px-4 py-3 border-b border-l border-white pl-12">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold bg-white text-slate-400 border border-slate-100">
                              {item.owner}
                            </div>
                            <p className="text-xs font-medium text-slate-500">{item.owner}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-white">
                          <p className="text-xs font-medium text-slate-600">{formatNumber(item.share)}</p>
                        </td>
                        <td className="px-4 py-3 border-b border-white">
                          <p className="text-xs font-mono text-slate-400">{item.price}</p>
                        </td>
                        <td className="px-4 py-3 border-b border-white text-right">
                          <p className={cn(
                            "text-xs font-medium",
                            item.change >= 0 ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {item.change >= 0 ? '+' : ''}{formatCurrency(item.change)}
                          </p>
                        </td>
                        <td className="px-4 py-3 border-b border-white text-right">
                          <p className="text-xs font-bold text-slate-600">{formatCurrency(item.value)}</p>
                        </td>
                        <td className="px-4 py-3 border-b border-white text-right">
                          <p className="text-xs font-medium text-slate-400">{formatCurrency(item.exposure)}</p>
                        </td>
                        <td className="px-4 py-3 border-b border-r border-white rounded-r-lg">
                          <p className="text-[10px] font-medium text-slate-400 uppercase">{item.bank}</p>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
