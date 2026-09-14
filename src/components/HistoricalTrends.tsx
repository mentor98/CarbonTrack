import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { PeriodRecord, EmissionFactor } from '../types/carbon';
import { calculateFootprint } from '../utils/calculator';
import { Plus, ArrowDownRight, ArrowUpRight, Copy, Calendar } from 'lucide-react';

interface HistoricalTrendsProps {
  periods: PeriodRecord[];
  factors: EmissionFactor[];
  activePeriodId: string;
  onSelectPeriod: (id: string) => void;
  onDuplicatePeriod: (sourcePeriodId: string) => void;
}

export const HistoricalTrends: React.FC<HistoricalTrendsProps> = ({
  periods,
  factors,
  activePeriodId,
  onSelectPeriod,
  onDuplicatePeriod
}) => {
  // Calculate footprint summaries for all periods
  const periodSummaries = periods.map(p => {
    const summary = calculateFootprint(p, factors);
    return {
      id: p.id,
      label: p.label,
      date: p.date,
      type: p.profileType,
      totalTonnes: Number(summary.totalTonnesCO2e.toFixed(2)),
      scope1: Number(summary.byScope.scope1Tonnes.toFixed(2)),
      scope2: Number(summary.byScope.scope2Tonnes.toFixed(2)),
      scope3: Number(summary.byScope.scope3Tonnes.toFixed(2)),
      transportation: Number(summary.byCategory.transportation.tonnesCO2e.toFixed(2)),
      electricity: Number(summary.byCategory.electricity.tonnesCO2e.toFixed(2)),
      heating_fuel: Number(summary.byCategory.heating_fuel.tonnesCO2e.toFixed(2)),
      food: Number(summary.byCategory.food.tonnesCO2e.toFixed(2)),
      business: Number(summary.byCategory.business.tonnesCO2e.toFixed(2)),
      minTonnes: Number(summary.minTonnesCO2e.toFixed(2)),
      maxTonnes: Number(summary.maxTonnesCO2e.toFixed(2))
    };
  });

  // Sort periods if date exists
  const sortedPeriods = [...periodSummaries].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Historical Greenhouse Gas Trajectory</h2>
          <p className="text-xs text-slate-500">
            Compare emissions progress across calendar years, audit cycles, or organizational entities.
          </p>
        </div>
        <button
          onClick={() => onDuplicatePeriod(activePeriodId)}
          className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 self-start cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicate Active Period</span>
        </button>
      </div>

      {/* Trajectory Area Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Emissions Trajectory by Scope (t CO₂e)</h3>
            <p className="text-xs text-slate-500">Scope 1 (Direct), Scope 2 (Grid), and Scope 3 (Value Chain)</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {sortedPeriods.length} Recorded Periods
          </span>
        </div>

        <div className="h-72 w-full">
          {sortedPeriods.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sortedPeriods} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val: any) => [`${val} t CO₂e`, '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="scope1" name="Scope 1 (Direct)" stackId="1" stroke="#ef4444" fill="#fca5a5" fillOpacity={0.6} />
                <Area type="monotone" dataKey="scope2" name="Scope 2 (Electricity)" stackId="1" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.6} />
                <Area type="monotone" dataKey="scope3" name="Scope 3 (Value Chain)" stackId="1" stroke="#10b981" fill="#86efac" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No historical periods created yet.
            </div>
          )}
        </div>
      </div>

      {/* Period-by-Period Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Period Records & Year-over-Year Delta
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Profile Period</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Total (t CO₂e)</th>
                <th className="px-4 py-3">90% Confidence Interval</th>
                <th className="px-4 py-3">Scope 1</th>
                <th className="px-4 py-3">Scope 2</th>
                <th className="px-4 py-3">Scope 3</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {sortedPeriods.map((p, idx) => {
                const prev = idx > 0 ? sortedPeriods[idx - 1] : null;
                const delta = prev ? p.totalTonnes - prev.totalTonnes : null;
                const isSelected = p.id === activePeriodId;

                return (
                  <tr 
                    key={p.id} 
                    className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{p.label}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 capitalize text-slate-600">
                      {p.type}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{p.totalTonnes} t</span>
                        {delta !== null && (
                          <span className={`text-[10px] font-bold flex items-center ${
                            delta < 0 ? 'text-emerald-700' : delta > 0 ? 'text-rose-700' : 'text-slate-500'
                          }`}>
                            {delta < 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {Math.abs(delta).toFixed(2)} t
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      [{p.minTonnes} – {p.maxTonnes} t]
                    </td>
                    <td className="px-4 py-3.5 font-mono text-rose-700 font-semibold">{p.scope1} t</td>
                    <td className="px-4 py-3.5 font-mono text-blue-700 font-semibold">{p.scope2} t</td>
                    <td className="px-4 py-3.5 font-mono text-emerald-700 font-semibold">{p.scope3} t</td>
                    <td className="px-4 py-3.5 text-right">
                      {!isSelected ? (
                        <button
                          onClick={() => onSelectPeriod(p.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Select
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
