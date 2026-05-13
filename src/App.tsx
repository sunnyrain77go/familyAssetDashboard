/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  PieChart, 
  ArrowRightLeft,
  Building2,
  User,
  LayoutDashboard,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
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
import { MOCK_DATA, PortfolioItem, Owner, Market } from './types';
import { cn, formatCurrency, formatNumber, formatWan } from './lib/utils';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function App() {
  const [data, setData] = useState<PortfolioItem[]>(MOCK_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string | 'All'>('All');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ownersList = useMemo(() => {
    return Array.from(new Set(data.map(item => item.owner))).sort();
  }, [data]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data
          .filter((row: any) => row.owner && row.id)
          .map((row: any) => ({
            owner: String(row.owner).trim(),
            id: String(row.id).trim(),
            share: Number(String(row.share).replace(/,/g, '')) || 0,
            price: Number(String(row.price).replace(/,/g, '')) || 0,
            _value: Number(String(row._value).replace(/,/g, '')) || 0,
            value: Number(String(row.value).replace(/,/g, '')) || 0,
            _exposure: Number(String(row._exposure).replace(/,/g, '')) || 0,
            exposure: Number(String(row.exposure).replace(/,/g, '')) || 0,
            _change: Number(String(row._change).replace(/,/g, '')) || 0,
            change: Number(String(row.change).replace(/,/g, '')) || 0,
            market: String(row.market || 'TW').trim(),
            bank: String(row.bank || 'Unknown').trim(),
            type: (
              String(row.type).toLowerCase().includes('fut') ? 'futures' : 
              String(row.type).toLowerCase().includes('cash') || String(row.type).includes('現') ? 'cash' : 
              'stock'
            ) as any
          })) as PortfolioItem[];
        
        if (parsed.length === 0) {
          alert('未能解析出有效數據，請檢查 CSV 欄位名稱是否正確。');
          setIsImporting(false);
          return;
        }
        
        setData(parsed);
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (error) => {
        console.error('CSV Parsing Error:', error);
        setIsImporting(false);
        alert('CSV 解析失敗，請檢查格式。');
      }
    });
  };

  // 1. Get data filtered by owner (if selected)
  const ownerFilteredData = useMemo(() => {
    return ownerFilter === 'All' 
      ? data 
      : data.filter(item => item.owner === ownerFilter);
  }, [data, ownerFilter]);

  // 2. Calculations based on the current owner filter (or all)
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

  // 3. Table data (filtering by owner + search term)
  const filteredTableData = useMemo(() => {
    return ownerFilteredData.filter(item => {
      return item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
             item.bank.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [ownerFilteredData, searchTerm]);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full glass shadow-sm px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Family Portfolio</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">全家資產監控儀表板</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-full border border-slate-200 overflow-x-auto max-w-[200px] md:max-w-none">
              <button
                onClick={() => setOwnerFilter('All')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0",
                  ownerFilter === 'All' 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                全家
              </button>
              {ownersList.map((o) => (
                <button
                  key={o}
                  onClick={() => setOwnerFilter(o)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0",
                    ownerFilter === o 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {o}
                </button>
              ))}
            </div>

            <div className="hidden md:block h-8 w-px bg-slate-200 mx-2" />

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm shrink-0",
                  isImporting && "opacity-50 cursor-not-allowed"
                )}
              >
                <Upload size={16} className={isImporting ? "animate-bounce" : ""} />
                {isImporting ? '導入中...' : '導入 CSV'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      {data === MOCK_DATA && (
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
            <Info className="text-indigo-600 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-indigo-900">
              <p className="font-bold mb-1">目前顯示範例數據</p>
              <p className="opacity-80">
                您可以點擊右上方「導入 CSV」上傳您整理好的股票 Sheet 導出的 CSV 檔案。
                欄位名稱請務必與您的原始 Sheet 一致 (owner, id, share, price, _value, value, _exposure, exposure, _change, change, market, bank, type)。
              </p>
              <div className="mt-2 flex items-center gap-4">
                <button 
                  onClick={() => {
                    const csvContent = "owner,id,share,price,_value,value,_exposure,exposure,_change,change,market,bank,type\n爸,0050,12811,96.85,1240745.35,1240745.35,1240745.35,1240745.35,-640.55,-640.55,TW,永豐金,stock";
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement("a");
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", "portfolio_template.csv");
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="text-xs font-bold underline hover:text-indigo-700"
                >
                  下載 CSV 範本
                </button>
                <div className="flex items-center gap-1.5 opacity-50">
                  <FileSpreadsheet size={14} />
                  <span className="text-[10px]">未來可通過 Google Sheets API 自動同步數據</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

        {/* Middle Section: Individual & Bank Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Distribution Area */}
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

          {/* Bank Reconciliation */}
          <div className="glass rounded-3xl p-8 flex flex-col">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-indigo-600" />
              券商帳戶(對帳用)
            </h3>
            <div className="space-y-4 flex-1">
              {bankData.sort((a, b) => b.value - a.value).map((bank, idx) => (
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

        {/* Search and Table */}
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
                <th className="px-4 py-3">張數 / 單位</th>
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
                      {item.type === 'cash' ? '-' : formatNumber(item.type === 'stock' ? item.share / 1000 : item.share)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.type === 'cash' ? '' : (item.type === 'stock' ? '張' : '口')}
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
    </div>
  );
}

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

function SummaryCard({ title, value, icon, subtitle, isProfit, isNumber, unit, delay }: SummaryCardProps) {
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
