import React, { useState } from 'react';
import { 
  Sliders, 
  X, 
  TrendingDown, 
  Trees, 
  Fuel, 
  Zap, 
  Car, 
  Home, 
  Utensils, 
  Plane, 
  Check, 
  RotateCcw,
  ThermometerSnowflake,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { PeriodRecord, EmissionFactor } from '../types/carbon';
import { simulateScenario } from '../utils/calculator';

interface ReductionScenariosProps {
  period: PeriodRecord;
  factors: EmissionFactor[];
  onClose: () => void;
  onApplyScenario: (updatedPeriod: PeriodRecord) => void;
}

export const ReductionScenarios: React.FC<ReductionScenariosProps> = ({
  period,
  factors,
  onClose,
  onApplyScenario
}) => {
  const [greenElectricity, setGreenElectricity] = useState(true);
  const [evVehicleShiftPercent, setEvVehicleShiftPercent] = useState(75);
  const [remoteWorkDaysPerWeek, setRemoteWorkDaysPerWeek] = useState(2);
  const [lowCarbonDiet, setLowCarbonDiet] = useState(true);
  const [heatPumpAdoption, setHeatPumpAdoption] = useState(false);
  const [reduceFlightsPercent, setReduceFlightsPercent] = useState(30);

  const simResult = simulateScenario(
    period,
    {
      greenElectricity,
      evVehicleShiftPercent,
      remoteWorkDaysPerWeek,
      lowCarbonDiet,
      heatPumpAdoption,
      reduceFlightsPercent
    },
    factors
  );

  const resetScenarios = () => {
    setGreenElectricity(false);
    setEvVehicleShiftPercent(0);
    setRemoteWorkDaysPerWeek(0);
    setLowCarbonDiet(false);
    setHeatPumpAdoption(false);
    setReduceFlightsPercent(0);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Emission Reduction Planner</h2>
              <p className="text-xs text-slate-600">
                Explore practical operational and personal changes to reduce emissions for <strong>{period.label}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Practical Comparison Summary Card (Human-friendly, grounded slate & emerald) */}
          <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 border border-slate-800 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Baseline vs Planned Trajectory */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Projected Annual Total
                </div>
                <div className="flex items-baseline gap-3">
                  <div>
                    <div className="text-3xl font-extrabold text-emerald-400">
                      {simResult.scenarioSummary.totalTonnesCO2e.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-300">Target footprint (t CO₂e/yr)</div>
                  </div>
                  <div className="text-slate-500 font-medium text-sm flex items-center">
                    <ArrowRight className="w-4 h-4 mx-1 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-400 line-through">
                      {simResult.baselineSummary.totalTonnesCO2e.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">Current baseline</div>
                  </div>
                </div>
              </div>

              {/* Net Avoided Carbon */}
              <div className="bg-slate-800/90 rounded-lg p-4 border border-slate-700">
                <div className="text-xs text-slate-300 font-medium mb-1">Annual Emissions Avoided</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    -{simResult.savedTonnes.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-300">tonnes CO₂e</span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>{simResult.reductionPercentage.toFixed(1)}% cut from baseline</span>
                </div>
              </div>

              {/* Tangible Human Context (EPA Equivalencies) */}
              <div className="space-y-2.5 text-xs border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Tangible Environmental Impact
                </div>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <Trees className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Equivalent to planting <strong className="text-white font-semibold">{simResult.treesEquivalent.toLocaleString()}</strong> tree seedlings and growing them for 10 years
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <Fuel className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Equal to saving <strong className="text-white font-semibold">{simResult.gasolineGallonsAvoided.toLocaleString()}</strong> gallons of gasoline from burning
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Intervention Levers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Practical Reduction Levers</h3>
                <p className="text-xs text-slate-500">Adjust the options below to see how each practical change affects your bottom line.</p>
              </div>
              <button
                onClick={resetScenarios}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer py-1 px-2 hover:bg-slate-100 rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Levers</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Lever 1: Green Electricity */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="lever-green-power" className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>100% Green Power Tariff or Rooftop Solar</span>
                  </label>
                  <input
                    id="lever-green-power"
                    type="checkbox"
                    checked={greenElectricity}
                    onChange={(e) => setGreenElectricity(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Switch electricity supply to a certified 100% renewable plan with retired energy certificates (RECs) or on-site solar.
                </p>
              </div>

              {/* Lever 2: Fleet / Commute Electrification */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-sky-700" />
                    <span>Switch Vehicles to Electric (EV)</span>
                  </div>
                  <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    {evVehicleShiftPercent}% Transitioned
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Replaces gasoline vehicle miles with efficient electric drive (0.092 kg CO₂e/mile vs. 0.385 kg).
                </p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={evVehicleShiftPercent}
                  onChange={(e) => setEvVehicleShiftPercent(Number(e.target.value))}
                  aria-label="Percentage of vehicles shifted to EV"
                  className="w-full accent-emerald-700 cursor-pointer"
                />
              </div>

              {/* Lever 3: Remote Work / Commuting Policy */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-slate-700" />
                    <span>Hybrid / Remote Work Commute Schedule</span>
                  </div>
                  <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    {remoteWorkDaysPerWeek} days/wk telework
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Eliminates physical commuting miles on remote work days for individuals or team staff.
                </p>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={remoteWorkDaysPerWeek}
                  onChange={(e) => setRemoteWorkDaysPerWeek(Number(e.target.value))}
                  aria-label="Remote work days per week"
                  className="w-full accent-emerald-700 cursor-pointer"
                />
              </div>

              {/* Lever 4: Low Carbon Diet */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="lever-diet" className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                    <Utensils className="w-4 h-4 text-emerald-700" />
                    <span>Plant-Forward Diet (Flexitarian Shift)</span>
                  </label>
                  <input
                    id="lever-diet"
                    type="checkbox"
                    checked={lowCarbonDiet}
                    onChange={(e) => setLowCarbonDiet(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Shift dietary baseline from meat-heavy consumption to low-meat/vegetarian options (~1,700 kg CO₂e/yr saved per person).
                </p>
              </div>

              {/* Lever 5: Heat Pump Conversion */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="lever-heat-pump" className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                    <ThermometerSnowflake className="w-4 h-4 text-orange-600" />
                    <span>Cold-Climate Heat Pump Installation</span>
                  </label>
                  <input
                    id="lever-heat-pump"
                    type="checkbox"
                    checked={heatPumpAdoption}
                    onChange={(e) => setHeatPumpAdoption(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Replaces 85% of natural gas furnace consumption with a high-efficiency electric heat pump system (COP 3.2).
                </p>
              </div>

              {/* Lever 6: Reduce Flights */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-indigo-700" />
                    <span>Aviation Travel Reduction</span>
                  </div>
                  <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    {reduceFlightsPercent}% Avoided
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Substitute non-essential regional flights with video conferencing or passenger rail travel.
                </p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={reduceFlightsPercent}
                  onChange={(e) => setReduceFlightsPercent(Number(e.target.value))}
                  aria-label="Percentage of flights avoided"
                  className="w-full accent-emerald-700 cursor-pointer"
                />
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close Planner
          </button>
          <button
            onClick={() => {
              onApplyScenario(simResult.scenarioRecord);
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Selected Reductions to Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
};
