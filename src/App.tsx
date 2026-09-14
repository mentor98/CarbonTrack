import React, { useState, useEffect } from 'react';
import { PeriodRecord, EmissionFactor, ProfileType } from './types/carbon';
import { DEFAULT_EMISSION_FACTORS, INITIAL_PRESETS } from './data/emissionFactors';
import { calculateFootprint } from './utils/calculator';
import { exportToJson, exportSummaryToCsv } from './utils/exportImport';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ActivityForm } from './components/ActivityForm';
import { HistoricalTrends } from './components/HistoricalTrends';
import { ReductionScenarios } from './components/ReductionScenarios';
import { FactorManager } from './components/FactorManager';
import { ReportModal } from './components/ReportModal';
import { TestRunnerModal } from './components/TestRunnerModal';

const LOCAL_STORAGE_KEY = 'carbontrack_state_v1';

const INITIAL_DEFAULT_PERIODS: PeriodRecord[] = [
  {
    id: 'period_2024',
    label: '2024 Current Inventory',
    date: '2024-12-31',
    profileType: 'personal',
    numberOfPeopleOrEmployees: 2,
    activities: {
      gasolineCarMiles: 7500,
      dieselCarMiles: 0,
      hybridCarMiles: 3000,
      electricVehicleMiles: 0,
      busMiles: 200,
      trainMiles: 600,
      shortFlightsKm: 1800,
      longFlightsKm: 4200,
      flightRadiativeForcing: true,
      businessVanMiles: 0,
      electricityKwh: 5800,
      gridRegionFactorId: 'elec_us_average',
      greenPowerPercentage: 0,
      naturalGasTherms: 480,
      heatingOilGallons: 0,
      propaneGallons: 15,
      woodPelletsKg: 0,
      dietType: 'medium_meat',
      foodWastePercent: 15,
      localFoodFactor: false,
      officeSqFt: 0,
      hvacEnergyKwh: 0,
      commuteEmployees: 0,
      commuteAvgMilesPerDay: 0,
      commuteWorkDaysPerYear: 0,
      cloudComputeHours: 0,
      paperAndSuppliesSpendUsd: 0,
      shippingPackagesCount: 45
    }
  },
  {
    id: 'period_2023',
    label: '2023 Previous Year',
    date: '2023-12-31',
    profileType: 'personal',
    numberOfPeopleOrEmployees: 2,
    activities: {
      gasolineCarMiles: 9200,
      dieselCarMiles: 0,
      hybridCarMiles: 0,
      electricVehicleMiles: 0,
      busMiles: 100,
      trainMiles: 400,
      shortFlightsKm: 2500,
      longFlightsKm: 4200,
      flightRadiativeForcing: true,
      businessVanMiles: 0,
      electricityKwh: 6400,
      gridRegionFactorId: 'elec_us_average',
      greenPowerPercentage: 0,
      naturalGasTherms: 550,
      heatingOilGallons: 0,
      propaneGallons: 20,
      woodPelletsKg: 0,
      dietType: 'heavy_meat',
      foodWastePercent: 20,
      localFoodFactor: false,
      officeSqFt: 0,
      hvacEnergyKwh: 0,
      commuteEmployees: 0,
      commuteAvgMilesPerDay: 0,
      commuteWorkDaysPerYear: 0,
      cloudComputeHours: 0,
      paperAndSuppliesSpendUsd: 0,
      shippingPackagesCount: 50
    }
  }
];

export default function App() {
  // Load initial state from localStorage if available
  const [periods, setPeriods] = useState<PeriodRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.periods && Array.isArray(parsed.periods) && parsed.periods.length > 0) {
          return parsed.periods;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved periods from localStorage', e);
    }
    return INITIAL_DEFAULT_PERIODS;
  });

  const [activePeriodId, setActivePeriodId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activePeriodId) return parsed.activePeriodId;
      }
    } catch (e) {}
    return INITIAL_DEFAULT_PERIODS[0].id;
  });

  const [factors, setFactors] = useState<EmissionFactor[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.emissionFactors && Array.isArray(parsed.emissionFactors) && parsed.emissionFactors.length > 0) {
          return parsed.emissionFactors;
        }
      }
    } catch (e) {}
    return DEFAULT_EMISSION_FACTORS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'trends'>('overview');
  const [showScenariosModal, setShowScenariosModal] = useState(false);
  const [showFactorsModal, setShowFactorsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTestsModal, setShowTestsModal] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        periods,
        activePeriodId,
        emissionFactors: factors
      }));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }, [periods, activePeriodId, factors]);

  // Current active period
  const activePeriod = periods.find(p => p.id === activePeriodId) || periods[0];

  // Calculate current summary reactively
  const summary = calculateFootprint(activePeriod, factors);

  // Handlers
  const handleUpdateActivities = (updated: Partial<PeriodRecord['activities']>) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === activePeriodId) {
        return {
          ...p,
          activities: { ...p.activities, ...updated }
        };
      }
      return p;
    }));
  };

  const handleUpdateMeta = (updated: Partial<PeriodRecord>) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === activePeriodId) {
        return { ...p, ...updated };
      }
      return p;
    }));
  };

  const handleAddPeriod = (label: string, type: ProfileType) => {
    const newId = `period_${Date.now()}`;
    const newRecord: PeriodRecord = {
      id: newId,
      label,
      date: new Date().toISOString().slice(0, 10),
      profileType: type,
      numberOfPeopleOrEmployees: type === 'business' ? 5 : 1,
      squareFootage: type === 'business' ? 1500 : 0,
      activities: {
        gasolineCarMiles: 0,
        dieselCarMiles: 0,
        hybridCarMiles: 0,
        electricVehicleMiles: 0,
        busMiles: 0,
        trainMiles: 0,
        shortFlightsKm: 0,
        longFlightsKm: 0,
        flightRadiativeForcing: true,
        businessVanMiles: 0,
        electricityKwh: type === 'business' ? 10000 : 3000,
        gridRegionFactorId: 'elec_us_average',
        greenPowerPercentage: 0,
        naturalGasTherms: type === 'business' ? 300 : 200,
        heatingOilGallons: 0,
        propaneGallons: 0,
        woodPelletsKg: 0,
        dietType: 'medium_meat',
        foodWastePercent: 15,
        localFoodFactor: false,
        officeSqFt: type === 'business' ? 1500 : 0,
        hvacEnergyKwh: 0,
        commuteEmployees: type === 'business' ? 5 : 0,
        commuteAvgMilesPerDay: type === 'business' ? 12 : 0,
        commuteWorkDaysPerYear: type === 'business' ? 220 : 0,
        cloudComputeHours: 0,
        paperAndSuppliesSpendUsd: 0,
        shippingPackagesCount: 0
      }
    };

    setPeriods(prev => [newRecord, ...prev]);
    setActivePeriodId(newId);
    setActiveTab('activities');
  };

  const handleDuplicatePeriod = (sourcePeriodId: string) => {
    const source = periods.find(p => p.id === sourcePeriodId);
    if (!source) return;

    const copy: PeriodRecord = JSON.parse(JSON.stringify(source));
    copy.id = `period_${Date.now()}`;
    copy.label = `${source.label} (Copy)`;
    copy.date = new Date().toISOString().slice(0, 10);

    setPeriods(prev => [copy, ...prev]);
    setActivePeriodId(copy.id);
  };

  const handleLoadPreset = (presetKey: string) => {
    const preset = INITIAL_PRESETS[presetKey];
    if (!preset) return;

    const newId = `preset_${presetKey}_${Date.now()}`;
    const newRecord: PeriodRecord = {
      ...JSON.parse(JSON.stringify(preset.period)),
      id: newId,
      date: new Date().toISOString().slice(0, 10)
    };

    setPeriods(prev => [newRecord, ...prev]);
    setActivePeriodId(newId);
    setActiveTab('overview');
  };

  const handleApplyScenario = (updatedPeriod: PeriodRecord) => {
    setPeriods(prev => prev.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
  };

  // Factor handlers
  const handleUpdateFactor = (updated: EmissionFactor) => {
    setFactors(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const handleAddFactor = (newFactor: EmissionFactor) => {
    setFactors(prev => [newFactor, ...prev]);
  };

  const handleResetFactors = () => {
    if (window.confirm('Reset all emission factors to authoritative defaults (US EPA, UK DESNZ, IPCC)?')) {
      setFactors(DEFAULT_EMISSION_FACTORS);
    }
  };

  // Export handlers
  const handleExportJson = () => {
    exportToJson({
      version: '1.0',
      exportDate: new Date().toISOString(),
      periods,
      emissionFactors: factors,
      activePeriodId
    });
  };

  const handleExportCsv = () => {
    exportSummaryToCsv(activePeriod, summary);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.periods && Array.isArray(parsed.periods)) {
          setPeriods(parsed.periods);
          if (parsed.activePeriodId) setActivePeriodId(parsed.activePeriodId);
          else setActivePeriodId(parsed.periods[0].id);
        }

        if (parsed.emissionFactors && Array.isArray(parsed.emissionFactors)) {
          setFactors(parsed.emissionFactors);
        }

        alert('CarbonTrack backup successfully restored!');
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Navigation Header */}
      <Navbar
        periods={periods}
        activePeriodId={activePeriodId}
        onSelectPeriod={setActivePeriodId}
        onAddPeriod={handleAddPeriod}
        onLoadPreset={handleLoadPreset}
        onOpenScenarios={() => setShowScenariosModal(true)}
        onOpenFactors={() => setShowFactorsModal(true)}
        onOpenReport={() => setShowReportModal(true)}
        onOpenTests={() => setShowTestsModal(true)}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
        onImportJson={handleImportJson}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <OverviewDashboard
            summary={summary}
            period={activePeriod}
            onNavigateToActivities={() => setActiveTab('activities')}
            onOpenScenarios={() => setShowScenariosModal(true)}
            onOpenMethodology={() => setShowTestsModal(true)}
          />
        )}

        {activeTab === 'activities' && (
          <ActivityForm
            period={activePeriod}
            factors={factors}
            summary={summary}
            onChangeActivities={handleUpdateActivities}
            onChangeMeta={handleUpdateMeta}
            onOpenFactorsHub={() => setShowFactorsModal(true)}
          />
        )}

        {activeTab === 'trends' && (
          <HistoricalTrends
            periods={periods}
            factors={factors}
            activePeriodId={activePeriodId}
            onSelectPeriod={setActivePeriodId}
            onDuplicatePeriod={handleDuplicatePeriod}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-display">CarbonTrack</span>
            <span>•</span>
            <span>Open-Source GHG Protocol Calculator</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Apache 2.0 License</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowTestsModal(true)}
              className="hover:text-slate-800 underline cursor-pointer"
            >
              Methodology & Automated Tests
            </button>
            <button
              onClick={() => setShowFactorsModal(true)}
              className="hover:text-slate-800 underline cursor-pointer"
            >
              Citations & Factors
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="hover:text-slate-800 underline cursor-pointer"
            >
              Audit Report
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showScenariosModal && (
        <ReductionScenarios
          period={activePeriod}
          factors={factors}
          onClose={() => setShowScenariosModal(false)}
          onApplyScenario={handleApplyScenario}
        />
      )}

      {showFactorsModal && (
        <FactorManager
          factors={factors}
          onClose={() => setShowFactorsModal(false)}
          onUpdateFactor={handleUpdateFactor}
          onAddFactor={handleAddFactor}
          onResetFactors={handleResetFactors}
        />
      )}

      {showReportModal && (
        <ReportModal
          period={activePeriod}
          summary={summary}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showTestsModal && (
        <TestRunnerModal
          onClose={() => setShowTestsModal(false)}
        />
      )}

    </div>
  );
}
