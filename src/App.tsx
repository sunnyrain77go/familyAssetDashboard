/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CSVPage } from './pages/CSVPage';
import { SheetsPage } from './pages/SheetsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen pb-12 bg-slate-50/30">
        <Navbar />
        <main className="mt-4">
          <Routes>
            <Route path="/csv" element={<CSVPage />} />
            <Route path="/sheets" element={<SheetsPage />} />
            {/* Default to CSV page */}
            <Route path="/" element={<Navigate to="/csv" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
