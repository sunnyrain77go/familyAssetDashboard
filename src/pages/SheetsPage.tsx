/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Database, Settings, RefreshCw, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { PortfolioItem, MOCK_DATA } from '../types';
import { cn } from '../lib/utils';
import { DashboardContent } from '../components/DashboardContent';

export function SheetsPage() {
  const [data, setData] = useState<PortfolioItem[]>(MOCK_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string | 'All'>('All');
  const [isFetching, setIsFetching] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [sheetsConfig, setSheetsConfig] = useState({
    apiKey: localStorage.getItem('gs_api_key') || import.meta.env.VITE_GS_API_KEY || '',
    spreadsheetId: localStorage.getItem('gs_sheet_id') || import.meta.env.VITE_GS_SHEET_ID || '',
    range: localStorage.getItem('gs_range') || import.meta.env.VITE_GS_RANGE || 'Sheet1!A1:M',
  });

  const ownersList = useMemo(() => {
    return Array.from(new Set(data.map(item => item.owner))).sort();
  }, [data]);

  useEffect(() => {
    localStorage.setItem('gs_api_key', sheetsConfig.apiKey);
    localStorage.setItem('gs_sheet_id', sheetsConfig.spreadsheetId);
    localStorage.setItem('gs_range', sheetsConfig.range);
  }, [sheetsConfig]);

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
  }

  const fetchFromSheets = async () => {
    if (!sheetsConfig.apiKey || !sheetsConfig.spreadsheetId) {
      setShowConfig(true);
      return;
    }

    setIsFetching(true);
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsConfig.spreadsheetId}/values/${sheetsConfig.range}?key=${sheetsConfig.apiKey}`;
      const response = await axios.get(url);
      const rows = response.data.values;

      if (!rows || rows.length < 2) {
        alert('試算表數據不足。');
        return;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      const mapped = dataRows.map(row => {
        const obj: any = {};
        headers.forEach((header: string, index: number) => {
          obj[header.trim()] = row[index];
        });
        return obj;
      });

      const parsed = mapData(mapped);
      if (parsed.length > 0) {
        setData(parsed);
      } else {
        alert('未能解析有效數據。');
      }
    } catch (error) {
      console.error('Sheets API Error:', error);
      alert('從 Google Sheets 獲取數據失敗，請檢查 API Key 或 Spreadsheet ID。');
    } finally {
      setIsFetching(false);
    }
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
          <button
            onClick={fetchFromSheets}
            disabled={isFetching}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 shrink-0",
              isFetching && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
            {isFetching ? '同步中...' : 'Sheets 立即同步'}
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Settings size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="max-w-7xl mx-auto px-6 overflow-hidden"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Settings size={16} className="text-indigo-600" />
                  Google Sheets API 設定
                </h4>
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  獲取 API Key <ExternalLink size={12} />
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">API Key</label>
                  <input 
                    type="password"
                    placeholder="以 AIza... 開頭的 API 金鑰"
                    value={sheetsConfig.apiKey}
                    onChange={(e) => setSheetsConfig({...sheetsConfig, apiKey: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <p className={cn(
                    "text-[9px] ml-1 transition-colors",
                    sheetsConfig.apiKey.includes('googleusercontent.com') ? "text-rose-500 font-bold" : "text-slate-400"
                  )}>
                    提示：請使用 Google Cloud Console 產生的「API 金鑰」 (AIza...)
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Spreadsheet ID</label>
                  <input 
                    type="text"
                    placeholder="從網址複製 /d/ 之後的那串字元"
                    value={sheetsConfig.spreadsheetId}
                    onChange={(e) => setSheetsConfig({...sheetsConfig, spreadsheetId: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <p className="text-[9px] text-slate-400 ml-1">
                    範例：在 <code className="bg-slate-100 px-1 rounded">/d/1abc.../edit</code> 中的 <code className="bg-slate-100 px-1 rounded">1abc...</code> 部分。
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Range</label>
                  <input 
                    type="text"
                    placeholder="Sheet1!A1:M"
                    value={sheetsConfig.range}
                    onChange={(e) => setSheetsConfig({...sheetsConfig, range: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <p className="mt-4 text-[10px] text-slate-400 italic">
                * 設定將保存在您的瀏覽器本地 (localStorage)，不會上傳至伺服器。
                試算表必須設定為「知道連結的人均可檢視」。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(data === MOCK_DATA || !sheetsConfig.apiKey) && (
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-4">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
               <Database size={20} />
            </div>
            <div className="text-sm text-indigo-900">
              <p className="font-bold mb-1">Google Sheets API 串接模式 (Sheets 版本)</p>
              <p className="opacity-80">
                通過 Google Sheets API 自動同步。需填入 API Key 與 Spreadsheet ID，並將試算表權限設為公開檢視。
              </p>
              <div className="mt-2 flex items-center gap-4">
                <button 
                  onClick={() => setShowConfig(true)}
                  className="text-xs font-bold underline hover:text-indigo-700"
                >
                  點此設定 API 連結
                </button>
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
