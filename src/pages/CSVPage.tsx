/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Upload, FileSpreadsheet, Info } from 'lucide-react';
import Papa from 'papaparse';
import { PortfolioItem, MOCK_DATA } from '../types';
import { cn } from '../lib/utils';
import { DashboardContent } from '../components/DashboardContent';

export function CSVPage() {
  const [data, setData] = useState<PortfolioItem[]>(MOCK_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string | 'All'>('All');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ownersList = useMemo(() => {
    return Array.from(new Set(data.map(item => item.owner))).sort();
  }, [data]);

  const mapData = (rawData: any[]): PortfolioItem[] => {
    return rawData
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
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = mapData(results.data);
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

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-full border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setOwnerFilter('All')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0",
              ownerFilter === 'All' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
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
                ownerFilter === o ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              )}
            >
              {o}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 shrink-0",
              isImporting && "opacity-50 cursor-not-allowed"
            )}
          >
            <Upload size={18} className={isImporting ? "animate-bounce" : ""} />
            {isImporting ? '導入中...' : '導入 CSV 檔案'}
          </button>
        </div>
      </div>

      {data === MOCK_DATA && (
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-4">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
               <Upload size={20} />
            </div>
            <div className="text-sm text-indigo-900">
              <p className="font-bold mb-1">目前顯示範例數據 (CSV 版本)</p>
              <p className="opacity-80">
                您可以手動導入 CSV 檔案。欄位需包含 owner, id, share, price, _value, value, _exposure, exposure, _change, change, market, bank, type。
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
                  <span className="text-[10px]">支援跨市場、多幣別資產管理</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DashboardContent 
        data={data} 
        ownerFilter={ownerFilter} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        ownersList={ownersList}
      />
    </div>
  );
}
