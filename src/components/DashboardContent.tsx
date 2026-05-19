/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  PieChart, 
  ArrowRightLeft,
  Building2,
  User,
  Search,
  ArrowUpRight,
  ArrowDownRight
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
      };
    }).sort((a, b) => b.value - a.value);
  }, [ownerFilteredData]);

  const filteredTableData = useMemo(() => {
    return ownerFilteredData.filter(item => {
      return item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
             item.bank.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [ownerFilteredData, searchTerm]);

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
        />
        <SummaryCard 
          title="總曝險 (Exposure)" 
          value={totals.exposure} 
          icon={<ShieldCheck className="text-pink-600" />}
          subtitle="包含期貨總合名目價值"
          delay={0.2}
        />
        <SummaryCard 
          title="今日損益 (Change)" 
          value={totals.change} 
          icon={totals.change >= 0 ? <TrendingUp className="text-emerald-600" /> : <TrendingDown className="text-rose-600" />}
          isProfit={totals.change >= 0}
          subtitle="與前一日市值比較"
          delay={0.3}
        />
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
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                各人資產分配
              </h3>
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
                          <p className="font-semibold">{formatWan(owner.exposure)}</p>
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
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ownersData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: number) => [formatWan(val), '金額']}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                      {ownersData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
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
            {filteredTableData.map((item, idx) => (
              <motion.tr 
                key={`${item.id}-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white hover:bg-indigo-50/50 transition-colors"
              >
                <td className="px-4 py-4 rounded-l-2xl border-y border-l border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold",
                      ownerFilter === item.owner ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    )} style={{ 
                      backgroundColor: ownerFilter === 'All' ? COLORS[ownersList.indexOf(item.owner) % COLORS.length] + '20' : undefined,
                      color: ownerFilter === 'All' ? COLORS[ownersList.indexOf(item.owner) % COLORS.length] : undefined
                    }}>
                      {item.owner}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.id}</p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {item.type === 'cash' ? '現金餘額' : item.type}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 border-y border-slate-100">
                  <p className="text-sm font-semibold">
                    {formatNumber(item.share)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.type === 'stock' ? '股' : item.type === 'futures' ? '口' : '元'}
                  </p>
                </td>
                <td className="px-4 py-4 border-y border-slate-100">
                  <p className="text-sm font-mono">{item.price}</p>
                  <p className="text-[10px] text-slate-400">{item.market}</p>
                </td>
                <td className="px-4 py-4 border-y border-slate-100 text-right">
                  <div className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-bold",
                    item.change >= 0 ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {item.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {formatCurrency(item.change)}
                  </div>
                </td>
                <td className="px-4 py-4 border-y border-slate-100 text-right">
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(item.value)}</p>
                </td>
                <td className="px-4 py-4 border-y border-slate-100 text-right">
                  <p className="text-sm font-semibold text-slate-600">{formatCurrency(item.exposure)}</p>
                </td>
                <td className="px-4 py-4 border-y border-r border-slate-100 rounded-r-2xl">
                  <p className="text-xs font-medium text-slate-700">{item.bank}</p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{item.market}</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
