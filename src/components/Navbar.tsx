import React, { useState } from 'react';
import { 
  Leaf, 
  Building2, 
  User, 
  Sliders, 
  FileText, 
  Database, 
  LineChart, 
  CheckCircle2, 
  Download, 
  Upload, 
  FolderDown,
  Plus
} from 'lucide-react';
import { PeriodRecord, ProfileType } from '../types/carbon';
import { INITIAL_PRESETS } from '../data/emissionFactors';

interface NavbarProps {
  periods: PeriodRecord[];
  activePeriodId: string;
  onSelectPeriod: (id: string) => void;
  onAddPeriod: (label: string, type: ProfileType) => void;
  onLoadPreset: (presetKey: string) => void;
  onOpenScenarios: () => void;
  onOpenFactors: () => void;
  onOpenReport: () => void;
  onOpenTests: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeTab: 'overview' | 'activities' | 'trends';
  setActiveTab: (tab: 'overview' | 'activities' | 'trends') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  periods,
  activePeriodId,
  onSelectPeriod,
  onAddPeriod,
  onLoadPreset,
  onOpenScenarios,
  onOpenFactors,
  onOpenReport,
  onOpenTests,
  onExportJson,
  onExportCsv,
  onImportJson,
  activeTab,
  setActiveTab
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<ProfileType>('personal');
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const activePeriod = periods.find(p => p.id === activePeriodId) || periods[0];

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onAddPeriod(newLabel.trim(), newType);
    setNewLabel('');
    setShowAddModal(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight font-display">CarbonTrack</span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                  OPEN SOURCE
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Personal & Small-Business GHG Calculator</p>
            </div>
          </div>

          {/* Primary View Switcher */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'activities'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Data Inputs & Formulas
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'trends'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Historical Trends
            </button>
          </nav>

          {/* Period Selector & Quick Actions */}
          <div className="flex items-center gap-2">
            
            {/* Period selector */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
              <div className="px-2 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                {activePeriod?.profileType === 'business' ? (
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="hidden sm:inline">Profile:</span>
              </div>
              <select
                value={activePeriodId}
                onChange={(e) => onSelectPeriod(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 pr-4 focus:outline-hidden cursor-pointer"
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.label} ({p.profileType === 'business' ? 'Business' : 'Personal'})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowAddModal(true)}
                title="Create or duplicate period"
                className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Presets dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPresetMenu(!showPresetMenu)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Presets</span>
              </button>
              {showPresetMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setShowPresetMenu(false)}
                >
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Load Pre-Configured Profile
                  </div>
                  {Object.entries(INITIAL_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onLoadPreset(key);
                        setShowPresetMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg transition-colors group"
                    >
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700">
                        {preset.label}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scenarios Button */}
            <button
              onClick={onOpenScenarios}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-700" />
              <span>Reduction Planner</span>
            </button>

            {/* Factors Hub Button */}
            <button
              onClick={onOpenFactors}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Emission Factors</span>
            </button>

            {/* Report Button */}
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Audit Report</span>
            </button>

            {/* Export / Import Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="Data Import / Export"
                className="p-1.5 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <FolderDown className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50"
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  <button
                    onClick={() => { onExportCsv(); setShowExportMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Export Audit CSV</span>
                  </button>
                  <button
                    onClick={() => { onExportJson(); setShowExportMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Export All Data (JSON)</span>
                  </button>
                  <label className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Import Data Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        onImportJson(e);
                        setShowExportMenu(false);
                      }}
                      className="hidden"
                    />
                  </label>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => { onOpenTests(); setShowExportMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-indigo-700 font-medium hover:bg-indigo-50 rounded-lg flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Methodology & Tests</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile sub-bar */}
      <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              activeTab === 'overview' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              activeTab === 'activities' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
            }`}
          >
            Inputs & Math
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              activeTab === 'trends' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
            }`}
          >
            Trends
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScenarios}
            className="text-xs text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Planner</span>
          </button>
          <button
            onClick={onOpenFactors}
            className="text-xs text-slate-700 font-medium"
          >
            Factors
          </button>
        </div>
      </div>

      {/* Add / Clone Period Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Tracking Profile / Period</h3>
            <p className="text-xs text-slate-500 mb-4">
              Track carbon emissions across separate calendar years, quarters, or organizational entities.
            </p>
            <form onSubmit={handleCreatePeriod} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025 Forecast, Q2 2024, Studio Branch"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Accounting Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('personal')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      newType === 'personal'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Personal / Home</div>
                      <div className="text-[11px] text-slate-500">Diet, vehicle, home utilities</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewType('business')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      newType === 'business'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Small Business</div>
                      <div className="text-[11px] text-slate-500">Office, staff commute, cloud</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
