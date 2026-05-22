/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
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
  const [sortBy, setSortBy] = useState<'value' | 'original'>('value');

  const toggleSymbol = (symbol: string) => {
    const newSet = new Set(expandedSymbols);
    if (newSet.has(symbol)) {
      newSet.delete(symbol);
    } else {
      newSet.add(symbol);
    }
    setExpandedSymbols(newSet);
  };
  
  // 1. Get data filtered by owner (if selected)
  const ownerFilteredData = useMemo(() => {
    return ownerFilter === 'All' 
      ? data 
      : data.filter(item => item.owner === ownerFilter);
  }, [data, ownerFilter]);

  // 2. Calculations
  const totals = useMemo(() => {
    return ownerFilteredData.reduce((acc, item) => ({
      value: acc.value + item.value,
      exposure: acc.exposure + item.exposure,
      change: acc.change + item.change,
      cash: acc.cash + (item.type === 'cash' ? item.value : 0)
    }), { value: 0, exposure: 0, change: 0, cash: 0 });
  }, [ownerFilteredData]);

  const ownersData = useMemo(() => {
    return ownersList.map(owner => {
      const items = data.filter(item => item.owner === owner);
      return {
        name: owner,
        value: items.reduce((sum, item) => sum + item.value, 0),
        exposure: items.reduce((sum, item) => sum + item.exposure, 0),
        change: items.reduce((sum, item) => sum + item.change, 0),
        cash: items.reduce((sum, item) => sum + (item.type === 'cash' ? item.value : 0), 0)
      };
    });
  }, [data, ownersList]);

  const bankData = useMemo(() => {
    const banks = Array.from(new Set(ownerFilteredData.map(item => item.bank)));
    return banks.map(bank => {
      const items = ownerFilteredData.filter(item => item.bank === bank);
      return {
        name: bank,
        value: items.reduce((sum, item) => sum + item.value, 0),
        market: items[0].market
      };
    });
  }, [ownerFilteredData]);

  const marketData = useMemo(() => {
    const markets = Array.from(new Set(ownerFilteredData.map(item => item.market)));
    return markets.map(market => {
      const items = ownerFilteredData.filter(item => item.market === market);
      return {
        name: market,
        value: items.reduce((sum, item) => sum + item.value, 0),
        exposure: items.reduce((sum, item) => sum + item.exposure, 0),
        change: items.reduce((sum, item) => sum + item.change, 0),
      };
    }).sort((a, b) => b.value - a.value);
  }, [ownerFilteredData]);

  const filteredTableData = useMemo(() => {
    return ownerFilteredData.filter(item => {
      return item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
             item.bank.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [ownerFilteredData, searchTerm]);

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
    } else {
      return result.sort((a, b) => b.totalValue - a.totalValue);
    }
  }, [filteredTableData, sortBy, data]);

  return (
    <main className="max-w-7xl mx-auto px-6 space-y-8">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="總市值 (Value)" 
          value={totals.value} 
          icon={<Wallet className="text-indigo-600" />}
          subtitle="包含股票與現金市值"
          delay={0.1}
        >
          <div className="space-y-1">
            {marketData.map((m) => (
              <div key={m.name} className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-medium">{m.name} 市場</span>
                <span className="font-bold text-indigo-500">
                  {formatCurrency(m.value)}
                </span>
              </div>
            ))}
          </div>
        </SummaryCard>
        <SummaryCard 
          title="總曝險 (Exposure)" 
          value={totals.exposure} 
          icon={<ShieldCheck className="text-pink-600" />}
          subtitle="包含期貨總合名目價值"
          delay={0.2}
        >
          <div className="space-y-1">
            {marketData.map((m) => (
              <div key={m.name} className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-medium">{m.name} 市場</span>
                <span className="font-bold text-pink-500">
                  {formatCurrency(m.exposure)}
                </span>
              </div>
            ))}
          </div>
        </SummaryCard>
        <SummaryCard 
          title="今日損益 (Change)" 
          value={totals.change} 
          icon={totals.change >= 0 ? <TrendingUp className="text-emerald-600" /> : <TrendingDown className="text-rose-600" />}
          isProfit={totals.change >= 0}
          subtitle="與前一日市值比較"
          delay={0.3}
        >
          <div className="space-y-1">
            {marketData.map((m, idx) => (
              <div key={m.name} className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-medium">{m.name} 市場</span>
                <span className={cn(
                  "font-bold",
                  m.change >= 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  {m.change >= 0 ? '+' : ''}{formatCurrency(m.change)}
                </span>
              </div>
            ))}
          </div>
        </SummaryCard>
        <SummaryCard 
          title="總現金 (Cash)" 
          value={totals.cash} 
          icon={<Wallet className="text-amber-600" />}
          subtitle="各帳戶閒置資金總和"
          delay={0.4}
        />
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
                          <p className="text-xs text-slate-400">現金</p>
                          <p className="font-semibold text-amber-600">{formatWan(owner.cash)}</p>
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
                    <Building2 size={14} /> 全家市場分佈
                  </h4>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={marketData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {marketData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: number) => formatWan(val)} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {marketData.map((m, idx) => (
                      <div key={m.name} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(idx + 2) % COLORS.length] }} />
                          <span className="font-medium text-slate-600">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-700">{formatWan(m.value)}</span>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {((m.value / totals.value) * 100).toFixed(1)}%
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
                {ownerFilter} 的市場區域分佈
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={marketData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {marketData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatWan(val)} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {marketData.map((m, idx) => (
                    <div key={m.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="font-bold text-slate-700">{m.name} 市場</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-600">
                          {((m.value / totals.value) * 100).toFixed(1)}%
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

        <div className="glass rounded-3xl p-8 flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Building2 size={20} className="text-indigo-600" />
            券商帳戶(對帳用)
          </h3>
          <div className="space-y-4 flex-1">
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
          <div className="mt-8 pt-8 border-t border-slate-100 h-[150px]">
             <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={bankData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bankData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatWan(val)} />
              </RePieChart>
            </ResponsiveContainer>
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
                              {group.type === 'cash' ? `${group.items.length} 個帳戶` : `${group.items.length} 筆持有`}
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
                        {group.type === 'stock' ? '股' : group.type === 'futures' ? '口' : '元'}
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
