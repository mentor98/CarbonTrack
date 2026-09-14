import React from 'react';
import { 
  FileText, 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  Scale, 
  Building2, 
  User, 
  Calendar 
} from 'lucide-react';
import { PeriodRecord, FootprintSummary } from '../types/carbon';
import { downloadMarkdownReport, exportSummaryToCsv } from '../utils/exportImport';

interface ReportModalProps {
  period: PeriodRecord;
  summary: FootprintSummary;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  period,
  summary,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const perCapita = summary.totalTonnesCO2e / Math.max(1, period.numberOfPeopleOrEmployees || 1);

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:max-h-none">
        
        {/* Header - Screen Only */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Greenhouse Gas Inventory Audit Report</h2>
              <p className="text-xs text-slate-500">
                Print-ready executive summary, Scope 1/2/3 breakdown, and itemized calculations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSummaryToCsv(period, summary)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => downloadMarkdownReport(period, summary)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Markdown</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-900 print:overflow-visible print:p-0">
          
          {/* Report Masthead */}
          <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider mb-1">
                CarbonTrack Open-Source Audit Report
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Greenhouse Gas Inventory
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                <span className="flex items-center gap-1 font-semibold">
                  {period.profileType === 'business' ? <Building2 className="w-3.5 h-3.5 text-indigo-600" /> : <User className="w-3.5 h-3.5 text-emerald-600" />}
                  {period.label}
                </span>
                <span>•</span>
                <span>Type: {period.profileType.toUpperCase()}</span>
                <span>•</span>
                <span>Headcount/Occupants: {period.numberOfPeopleOrEmployees || 1}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-slate-700">
                GHG PROTOCOL COMPLIANT
              </span>
            </div>
          </div>

          {/* Non-Exactness & Estimation Transparency Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-600" />
              <span>Statistical Estimation & Uncertainty Notice</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              This inventory represents an empirical statistical estimate based on user activity inputs and 
              authoritative secondary conversion factors published by the <strong>US EPA</strong>, <strong>UK DESNZ/DEFRA</strong>, 
              and <strong>IPCC AR6</strong>. <em>Greenhouse gas calculations are estimations and do not constitute direct physical measurements.</em> 
              The true carbon footprint is expected to lie within the calculated 90% confidence interval.
            </p>
          </div>

          {/* Executive Summary Metrics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">1. Executive Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Gross Footprint</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {summary.totalTonnesCO2e.toFixed(2)} <span className="text-xs font-normal text-slate-500">t CO₂e</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  90% CI: [{summary.minTonnesCO2e.toFixed(2)} – {summary.maxTonnesCO2e.toFixed(2)} t]
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/50">
                <div className="text-[11px] font-semibold text-rose-700 uppercase">Scope 1 (Direct)</div>
                <div className="text-2xl font-black text-rose-900 mt-1">
                  {summary.byScope.scope1Tonnes.toFixed(2)} <span className="text-xs font-normal text-rose-600">t</span>
                </div>
                <div className="text-[10px] text-rose-600 mt-1">
                  {summary.totalTonnesCO2e > 0 ? ((summary.byScope.scope1Tonnes / summary.totalTonnesCO2e) * 100).toFixed(1) : 0}% of total
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50">
                <div className="text-[11px] font-semibold text-blue-700 uppercase">Scope 2 (Electricity)</div>
                <div className="text-2xl font-black text-blue-900 mt-1">
                  {summary.byScope.scope2Tonnes.toFixed(2)} <span className="text-xs font-normal text-blue-600">t</span>
                </div>
                <div className="text-[10px] text-blue-600 mt-1">
                  {summary.totalTonnesCO2e > 0 ? ((summary.byScope.scope2Tonnes / summary.totalTonnesCO2e) * 100).toFixed(1) : 0}% of total
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <div className="text-[11px] font-semibold text-emerald-700 uppercase">Scope 3 (Value Chain)</div>
                <div className="text-2xl font-black text-emerald-900 mt-1">
                  {summary.byScope.scope3Tonnes.toFixed(2)} <span className="text-xs font-normal text-emerald-600">t</span>
                </div>
                <div className="text-[10px] text-emerald-600 mt-1">
                  {summary.totalTonnesCO2e > 0 ? ((summary.byScope.scope3Tonnes / summary.totalTonnesCO2e) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">2. Category Breakdown</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Emissions (t CO₂e)</th>
                    <th className="px-4 py-2.5">Share of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(Object.entries(summary.byCategory) as [string, { kgCO2e: number; tonnesCO2e: number; percentage: number }][]).map(([cat, data]) => (
                    <tr key={cat}>
                      <td className="px-4 py-2.5 font-semibold text-slate-800 capitalize">
                        {cat.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                        {data.tonnesCO2e.toFixed(2)} t
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">
                        {data.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Itemized Calculation Audit Trail */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              3. Itemized Calculations & Source Citations
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Activity</th>
                    <th className="px-3 py-2.5">Scope</th>
                    <th className="px-4 py-2.5">Amount & Unit</th>
                    <th className="px-4 py-2.5">kg CO₂e</th>
                    <th className="px-4 py-2.5">Arithmetic Formula</th>
                    <th className="px-4 py-2.5">Cited Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.items.map((it) => (
                    <tr key={it.activityId} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{it.name}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px]">S{it.scope}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{it.amount.toLocaleString()} {it.unit}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {it.kgCO2e.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600 max-w-xs break-all">
                        {it.formula}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-slate-500 max-w-xs">
                        {it.sourceCitation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sign-off Footer */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Verified against GHG Protocol Corporate and Scope 3 Standards</span>
            <span className="font-mono text-[10px]">CarbonTrack Open Source v1.0</span>
          </div>

        </div>

      </div>
    </div>
  );
};
