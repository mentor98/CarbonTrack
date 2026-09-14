import React from 'react';
import { 
  AlertCircle, 
  Car, 
  Zap, 
  Flame, 
  Utensils, 
  Briefcase, 
  ArrowUpRight, 
  TrendingDown, 
  Info, 
  Target, 
  Scale, 
  Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { FootprintSummary, PeriodRecord, Benchmark, EmissionCategory } from '../types/carbon';
import { BENCHMARKS } from '../data/emissionFactors';

interface OverviewDashboardProps {
  summary: FootprintSummary;
  period: PeriodRecord;
  onNavigateToActivities: () => void;
  onOpenScenarios: () => void;
  onOpenMethodology: () => void;
}

const SCOPE_COLORS = {
  Scope1: '#ef4444', // Red / combustion
  Scope2: '#3b82f6', // Blue / electricity
  Scope3: '#10b981', // Emerald / value chain
};

const CATEGORY_COLORS: Record<string, string> = {
  transportation: '#0284c7', // Sky blue
  electricity: '#f59e0b', // Amber
  heating_fuel: '#ea580c', // Orange
  food: '#10b981', // Emerald
  business: '#8b5cf6'  // Purple
};

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  summary,
  period,
  onNavigateToActivities,
  onOpenScenarios,
  onOpenMethodology
}) => {
  const peopleCount = Math.max(1, period.numberOfPeopleOrEmployees || 1);
  const perUnitEmissions = summary.totalTonnesCO2e / peopleCount;

  // Pie chart data for Scopes
  const scopeData = [
    { name: 'Scope 1 (Direct Fuels)', value: Number(summary.byScope.scope1Tonnes.toFixed(2)), color: SCOPE_COLORS.Scope1 },
    { name: 'Scope 2 (Purchased Electricity)', value: Number(summary.byScope.scope2Tonnes.toFixed(2)), color: SCOPE_COLORS.Scope2 },
    { name: 'Scope 3 (Value Chain & Travel)', value: Number(summary.byScope.scope3Tonnes.toFixed(2)), color: SCOPE_COLORS.Scope3 }
  ].filter(d => d.value > 0);

  // Bar chart data for Categories
  const categoryData = [
    { name: 'Transport', tonnes: Number(summary.byCategory.transportation.tonnesCO2e.toFixed(2)), key: 'transportation' },
    { name: 'Electricity', tonnes: Number(summary.byCategory.electricity.tonnesCO2e.toFixed(2)), key: 'electricity' },
    { name: 'Heating/Fuel', tonnes: Number(summary.byCategory.heating_fuel.tonnesCO2e.toFixed(2)), key: 'heating_fuel' },
    { name: 'Food / Diet', tonnes: Number(summary.byCategory.food.tonnesCO2e.toFixed(2)), key: 'food' },
    { name: 'Business Ops', tonnes: Number(summary.byCategory.business.tonnesCO2e.toFixed(2)), key: 'business' }
  ].filter(d => d.tonnes > 0);

  // Relevant Benchmarks
  const relevantBenchmarks = BENCHMARKS.filter(b => 
    period.profileType === 'business' ? b.type === 'business' : b.type === 'personal'
  );

  // Identify highest category
  let topCategory: EmissionCategory = 'transportation';
  let maxCatTonnes = 0;
  for (const cat of Object.keys(summary.byCategory) as EmissionCategory[]) {
    const data = summary.byCategory[cat];
    if (data.tonnesCO2e > maxCatTonnes) {
      maxCatTonnes = data.tonnesCO2e;
      topCategory = cat;
    }
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Transparent Non-Exactness & Uncertainty Banner */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 text-slate-800 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
            <Scale className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-amber-950 text-sm tracking-tight">
                Statistical Estimation & 90% Confidence Interval
              </span>
              <span className="bg-amber-200/80 text-amber-900 font-semibold text-[11px] px-2 py-0.5 rounded-full">
                IPCC Quadrature Propagation
              </span>
            </div>
            <p className="text-amber-900/90 leading-relaxed">
              <strong>Estimates are never exact physical measurements.</strong> Greenhouse gas calculations rely on secondary conversion factors from the 
              US EPA, UK DESNZ, and IPCC. Based on empirical factor uncertainties, your true footprint lies between{' '}
              <strong className="text-amber-950 underline decoration-amber-400 font-bold">
                {summary.minTonnesCO2e.toFixed(2)} and {summary.maxTonnesCO2e.toFixed(2)} tonnes CO₂e
              </strong>{' '}
              (central estimate: <strong>{summary.totalTonnesCO2e.toFixed(2)} t CO₂e</strong>).
            </p>
            <div className="pt-1">
              <button 
                onClick={onOpenMethodology}
                className="text-amber-900 hover:text-amber-950 font-semibold text-[11px] underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Read methodology, assumptions & automated tests</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Footprint */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Footprint</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.totalTonnesCO2e.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-slate-500">t CO₂e</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>90% CI: [{summary.minTonnesCO2e.toFixed(1)} – {summary.maxTonnesCO2e.toFixed(1)} t]</span>
            <span className="font-medium text-slate-700">
              {period.profileType === 'business' ? `${perUnitEmissions.toFixed(2)} t/staff` : `${perUnitEmissions.toFixed(2)} t/person`}
            </span>
          </div>
        </div>

        {/* Scope 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Scope 1 (Direct)</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.byScope.scope1Tonnes.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-slate-500">t CO₂e</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {summary.totalTonnesCO2e > 0
              ? `${((summary.byScope.scope1Tonnes / summary.totalTonnesCO2e) * 100).toFixed(1)}% of total · Vehicles & on-site gas`
              : 'Direct stationary & mobile combustion'}
          </div>
        </div>

        {/* Scope 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Scope 2 (Electricity)</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.byScope.scope2Tonnes.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-slate-500">t CO₂e</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {summary.totalTonnesCO2e > 0
              ? `${((summary.byScope.scope2Tonnes / summary.totalTonnesCO2e) * 100).toFixed(1)}% of total · Purchased grid energy`
              : 'Market-adjusted indirect energy'}
          </div>
        </div>

        {/* Scope 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Scope 3 (Value Chain)</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.byScope.scope3Tonnes.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-slate-500">t CO₂e</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {summary.totalTonnesCO2e > 0
              ? `${((summary.byScope.scope3Tonnes / summary.totalTonnesCO2e) * 100).toFixed(1)}% of total · Travel, diet, supply`
              : 'Indirect upstream & downstream'}
          </div>
        </div>

      </div>

      {/* 3. Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Scope Breakdown Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Emissions by GHG Protocol Scope</h3>
                <p className="text-xs text-slate-500">Standard corporate & personal GHG boundary allocation</p>
              </div>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Corporate Standard
              </span>
            </div>

            <div className="h-64 w-full">
              {scopeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scopeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {scopeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`${val} t CO₂e`, 'Emissions']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No activity data recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-2 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-bold text-rose-600">{summary.byScope.scope1Tonnes.toFixed(2)} t</div>
              <div className="text-[10px] text-slate-400 uppercase">Scope 1</div>
            </div>
            <div>
              <div className="font-bold text-blue-600">{summary.byScope.scope2Tonnes.toFixed(2)} t</div>
              <div className="text-[10px] text-slate-400 uppercase">Scope 2</div>
            </div>
            <div>
              <div className="font-bold text-emerald-600">{summary.byScope.scope3Tonnes.toFixed(2)} t</div>
              <div className="text-[10px] text-slate-400 uppercase">Scope 3</div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Emissions by Category</h3>
                <p className="text-xs text-slate-500">Distribution across operational and lifestyle domains</p>
              </div>
              <button
                onClick={onNavigateToActivities}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Inputs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64 w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      formatter={(val: any) => [`${val} t CO₂e`, 'Emissions']}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                    />
                    <Bar dataKey="tonnes" radius={[6, 6, 0, 0]}>
                      {categoryData.map((entry) => (
                        <Cell key={entry.key} fill={CATEGORY_COLORS[entry.key] || '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No activity data recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Largest Emission Contributor:</span>
            <span className="font-bold text-slate-900 capitalize">
              {topCategory.replace('_', ' ')} ({summary.byCategory[topCategory as keyof typeof summary.byCategory]?.percentage.toFixed(1)}%)
            </span>
          </div>
        </div>

      </div>

      {/* 4. Climate Benchmark & Target Comparison */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Benchmark & Target Comparison</h3>
            <p className="text-xs text-slate-500">
              How this {period.profileType === 'business' ? 'organization (per employee)' : 'individual'} compares against global and sector averages
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg self-start">
            Your Rate: <strong>{perUnitEmissions.toFixed(2)} t CO₂e / unit</strong>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {relevantBenchmarks.map((b) => {
            const isBetter = perUnitEmissions <= b.tonnesCO2e;
            const diffPct = Math.abs(((perUnitEmissions - b.tonnesCO2e) / b.tonnesCO2e) * 100);
            const barPct = Math.min(100, (perUnitEmissions / (b.tonnesCO2e * 1.5)) * 100);

            return (
              <div key={b.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{b.title}</span>
                    <span className="text-slate-500 ml-2">({b.tonnesCO2e} t CO₂e)</span>
                  </div>
                  <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    isBetter ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isBetter ? `${diffPct.toFixed(0)}% lower` : `${diffPct.toFixed(0)}% higher`}
                  </span>
                </div>

                {/* Progress visual comparison */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full transition-all duration-500 ${isBetter ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                    style={{ width: `${Math.max(5, barPct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{b.description}</span>
                  <span className="text-[10px] text-slate-400">Ref: {b.source}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Decarbonization Action Callout */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
              Action Planning
            </span>
            <span className="text-xs text-slate-400">Target Setting & Policy Modeling</span>
          </div>
          <h4 className="text-lg font-bold tracking-tight text-white">
            Model Practical Opportunities to Lower Your Footprint
          </h4>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Evaluate tangible interventions—such as green power contracts, vehicle electrification, hybrid telework schedules, 
            and heat pump installations—with immediate calculations of avoided carbon and practical equivalents.
          </p>
        </div>
        <button
          onClick={onOpenScenarios}
          className="shrink-0 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Sliders className="w-4 h-4" />
          <span>Open Reduction Planner</span>
        </button>
      </div>

    </div>
  );
};
